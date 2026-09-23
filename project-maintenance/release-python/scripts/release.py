#!/usr/bin/env python3
"""
The whole release flow. Python 3.9+, git and gh. No third-party packages.

    just release 1.2.3          test, bump, changelog, commit, tag, publish,
                                push, create the GitHub release
    just release-finish 1.2.3   push and create the release for an already
                                published version. Safe to rerun.
    just unrelease 1.2.3        undo a release that never left this machine

Version format: MAJOR.MINOR.PATCH, no "v" (the tag adds it).
  breaking change -> major . new feature -> minor . fix -> patch
  Before 1.0: breaking change -> minor.  First release: 0.1.0

Before releasing, add notes under "## Unreleased" in CHANGELOG.md. They
become the GitHub release notes.

If something fails:
  before publish -> just unrelease 1.2.3       (nothing left your machine)
  after publish  -> just release-finish 1.2.3  (never roll back a published
                                                version; only go forward)
"""

import os
import re
import shutil
import subprocess
import sys
from datetime import date

# ---------------------------------------------------------------------------
# EDIT THESE THREE. VERSION in bump_cmd becomes the version being released.
# ---------------------------------------------------------------------------

test_cmd = "npm test"
bump_cmd = "npm version VERSION --no-git-tag-version"
publish_cmd = "npm publish"

# Presets -- copy one set over the three above.
#
#   node:           test_cmd = "npm test"
#                   bump_cmd = "npm version VERSION --no-git-tag-version"
#                   publish_cmd = "npm publish"
#
#   python (uv):    test_cmd = "uv run pytest"
#                   bump_cmd = "uv version VERSION"
#                   publish_cmd = "rm -rf dist && uv build && uv publish"
#
#   ships nothing:  publish_cmd = "true"
#
# ---------------------------------------------------------------------------
#
# Decisions behind this flow:
#   - Releases run from main only. No dev/main promotion.
#   - No prereleases.
#   - Protected org repos: don't use this starter; release through CI.
#   - Credentials: each ecosystem's native login (npm login; uv/PyPI token in
#     keyring or env). Never commit tokens.
#   - Tags are "v"-prefixed. To namespace them (e.g. lib-v*), change tag_of.
#   - Nothing is committed until every check has passed. The checks and
#     `git commit -am` depend on each other: don't remove the clean-tree check.
#   - Changelog file: set $CHANGELOG to use something other than CHANGELOG.md.

CHANGELOG = os.environ.get("CHANGELOG", "CHANGELOG.md")
SEMVER = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")


class Fail(Exception):
    """Every error. main() prints it and exits 1.

    Anywhere that wants to add context to a failure -- the undo instructions
    after a bump, say -- catches it, which is the whole of the error handling.
    """


def fail(msg):
    raise Fail(msg)


def fail_dirty(msg):
    """Fail after the bump has already touched files. The checks proved the
    tree was clean beforehand, so discarding everything is safe."""
    undo = "git checkout -- ."
    if git("ls-files", "--others", "--exclude-standard").out:
        undo += " && git clean -fd"
    if git("status", "--porcelain").out:
        fail(f"{msg} Nothing is committed. Undo with: {undo}")
    fail(f"{msg} Nothing changed.")


def warn(msg):
    print(f"warning: {msg}", file=sys.stderr, flush=True)


def say(msg):
    print(msg, flush=True)


def tag_of(version):
    return f"v{version}"


# --- Running things ----------------------------------------------------------


class Result:
    """A finished command. Truthy when it succeeded."""

    def __init__(self, proc):
        self.ok = proc.returncode == 0
        self.out = (proc.stdout or "").strip()

    def __bool__(self):
        return self.ok


def run(argv, stdin=None, quiet=False):
    """Run a command. stderr passes through unless quiet."""
    proc = subprocess.run(argv, input=stdin, capture_output=True, text=True)
    if proc.stderr and not quiet:
        sys.stderr.write(proc.stderr)
        sys.stderr.flush()
    return Result(proc)


def git(*args, **kw):
    return run(["git", *args], **kw)


def gh(*args, **kw):
    return run(["gh", *args], **kw)


def shell(cmd):
    """Run one of the three configured commands, output attached to ours."""
    return subprocess.run(["bash", "-eo", "pipefail", "-c", cmd]).returncode == 0


# --- CHANGELOG.md ------------------------------------------------------------


def is_heading(line, name):
    """Is this the "## NAME" heading? Matches "## 1.2.3" and
    "## 1.2.3 - 2026-01-01", but not "## 1.2.30" or "### 1.2.3"."""
    if not line.startswith("## "):
        return False
    head = line[3:].strip()
    return head == name or head.startswith(name + " ")


def cl_section_body(name):
    """The lines between "## NAME" and the next "## ", with blank lines
    trimmed off each end. None if there is no such section."""
    found, body = False, []
    for line in read_changelog().splitlines():
        if line.startswith("## "):
            if found:
                break
            found = is_heading(line, name)
            continue
        if found:
            body.append(line)
    if not found:
        return None
    while body and not body[0].strip():
        body.pop(0)
    while body and not body[-1].strip():
        body.pop()
    return "\n".join(body)


def read_changelog():
    if not os.path.isfile(CHANGELOG):
        return ""
    with open(CHANGELOG, encoding="utf-8") as f:
        return f.read()


def cl_check():
    """Fail unless "## Unreleased" has notes under it."""
    if not os.path.isfile(CHANGELOG) or not cl_section_body("Unreleased"):
        fail(
            f'{CHANGELOG} has no notes under "## Unreleased" — '
            "add a line describing this release, then rerun."
        )


def cl_rotate(version):
    """Turn "## Unreleased" into "## VERSION - DATE", leaving an empty
    "## Unreleased" on top for next time."""
    cl_check()
    if cl_section_body(version) is not None:
        fail(f'{CHANGELOG} already has a "## {version}" section — pick a new version.')
    today = date.today().isoformat()
    out, done = [], False
    for line in read_changelog().splitlines():
        if not done and is_heading(line, "Unreleased"):
            out += ["## Unreleased", "", f"## {version} - {today}"]
            done = True
            continue
        out.append(line)
    tmp = f"{CHANGELOG}.tmp.{os.getpid()}"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    os.replace(tmp, CHANGELOG)


def cl_notes(version):
    """The notes for VERSION."""
    if not os.path.isfile(CHANGELOG):
        fail(f"{CHANGELOG} not found.")
    body = cl_section_body(version)
    if body is None:
        fail(f'{CHANGELOG} has no "## {version}" section.')
    return body


# --- Checks ------------------------------------------------------------------


def last_release():
    """The highest v-tag already released, or None."""
    for tag in git("tag", "--list", "v*", "--sort=-v:refname").out.splitlines():
        if SEMVER.match(tag[1:]):
            return tag[1:]
    return None


def check_releasable(version):
    """Everything that must be true before VERSION can be released. Changes
    nothing, so a failure here always leaves the project exactly as it was."""
    tag = tag_of(version)

    # 1. Version format
    if not SEMVER.match(version):
        fail('Version must look like 1.2.3 (no "v" prefix).')

    # 2. Tools
    for tool, url in (("git", "https://git-scm.com"), ("gh", "https://cli.github.com")):
        if not shutil.which(tool):
            fail(f"{tool} not found — install it: {url}")

    # 3. Branch
    branch = git("branch", "--show-current").out
    if branch != "main":
        fail(
            f"Releases run from main (you're on {branch or 'a detached HEAD'}) "
            "— git switch main"
        )

    # 4. Clean tree, untracked files included (release relies on this for
    #    `git commit -am`)
    if git("status", "--porcelain").out:
        fail("Working tree not clean — commit or stash first. git status")

    # 5. Changelog notes
    cl_check()

    # 6. Version goes up. No tags yet means this is the first release.
    last = last_release()
    if last:
        if version == last:
            fail(
                f"Tag {tag} already exists locally — pick a new version, "
                f"or git tag -d {tag} if it's stale."
            )
        if parse(version) <= parse(last):
            fail(f"{version} must be greater than the last release ({last}).")

    # 7. Tag is new locally
    if git("rev-parse", "-q", "--verify", f"refs/tags/{tag}", quiet=True):
        fail(
            f"Tag {tag} already exists locally — pick a new version, "
            f"or git tag -d {tag} if it's stale."
        )

    # 8. In sync with origin (--no-tags: this check doesn't create local tags)
    if not git("fetch", "--quiet", "--no-tags", "origin", "main"):
        fail("Couldn't fetch from origin — check your network and remote, then rerun.")
    if git("rev-parse", "HEAD").out != git("rev-parse", "origin/main").out:
        fail("Not in sync with origin/main — git pull (or push your commits first).")

    # 9. Tag is new on origin
    remote = git("ls-remote", "--tags", "origin", f"refs/tags/{tag}")
    if not remote:
        fail("Couldn't list tags on origin — check your network and remote, then rerun.")
    if remote.out:
        fail(f"Tag {tag} already exists on origin — pick a new version.")

    # 10. gh can create the GitHub release
    if not gh("auth", "status", quiet=True):
        fail("gh is not authenticated — gh auth login")

    # 11. Branch protection. Best effort: an unreachable API never blocks a
    #     release.
    rules = gh(
        "api",
        "repos/{owner}/{repo}/rules/branches/main",
        "--jq",
        '[.[] | select(.type=="pull_request")] | length',
        quiet=True,
    )
    if rules:
        if rules.out.isdigit() and int(rules.out) > 0:
            fail(
                "main requires pull requests — this starter can't push there. "
                "Protected repos should release through CI."
            )
    else:
        warn("Couldn't check main's rulesets on GitHub — continuing.")

    protected = gh(
        "api", "repos/{owner}/{repo}/branches/main", "--jq", ".protected", quiet=True
    )
    if protected:
        if protected.out == "true":
            warn(
                "main has classic branch protection — if it requires reviews, the "
                "push will be rejected after publishing. Ctrl-C now if so."
            )
    else:
        warn("Couldn't check main's branch protection on GitHub — continuing.")

    say(f"Ready to release {version}" + (f" (last release: {last})" if last else ""))


def parse(version):
    """1.2.3 -> (1, 2, 3), so 0.10.0 sorts above 0.9.0."""
    return tuple(int(part) for part in version.split("."))


# --- Commands ----------------------------------------------------------------


def cmd_release(version):
    """Test, bump, tag, publish, push, and create the GitHub release."""
    tag = tag_of(version)
    check_releasable(version)

    say("==> Testing")
    if not shell(test_cmd):
        fail_dirty(f"Tests failed. Fix them, then rerun: just release {version}")

    say(f"==> Bumping to {version}")
    if not shell(bump_cmd.replace("VERSION", version)):
        fail_dirty("Bump failed.")

    say(f"==> Updating {CHANGELOG}")
    try:
        cl_rotate(version)
    except Fail as e:
        print(e, file=sys.stderr, flush=True)
        fail_dirty("Changelog update failed.")

    say(f"==> Committing and tagging {tag}")
    if not git("commit", "--quiet", "-am", f"Release {version}"):
        fail_dirty("Commit failed.")
    if not git("tag", "-a", tag, "-m", tag):
        fail("Tagging failed. Undo the release commit with: git reset --keep HEAD~1")

    # Point of no return: once publish succeeds, never roll back. Finish forward.
    say("==> Publishing")
    if not shell(publish_cmd):
        fail(
            f"Publish failed — nothing has left your machine. "
            f"Undo with: just unrelease {version}"
        )

    # Say so out loud, because every failure from here on is a finish-forward
    # one and cmd_finish's own messages all name release-finish.
    say(f"==> Published {version}. There is no going back now, only forward.")
    cmd_finish(version)


def cmd_finish(version):
    """Push and create the GitHub release for a published VERSION. Safe to
    rerun."""
    tag = tag_of(version)

    if not git("rev-parse", "-q", "--verify", f"refs/tags/{tag}", quiet=True):
        fail(f"No local tag {tag} — nothing to finish.")
    branch = git("branch", "--show-current").out
    if branch != "main":
        fail(
            f"release-finish pushes main (you're on {branch or 'a detached HEAD'}) "
            f"— git switch main, then rerun: just release-finish {version}"
        )
    if not git("merge-base", "--is-ancestor", f"{tag}^{{commit}}", "HEAD"):
        fail(
            f"HEAD doesn't contain {tag}, so pushing main wouldn't publish it. "
            f"Get main back to (or after) {tag}, then rerun: "
            f"just release-finish {version}"
        )

    say(f"==> Pushing main and {tag}")
    if not git("push", "origin", "main", "--follow-tags"):
        fail(
            "Push failed. Fix the problem above, then rerun: "
            f"just release-finish {version}"
        )

    if gh("release", "view", tag, quiet=True):
        say(f"GitHub release {tag} already exists")
    else:
        say(f"==> Creating GitHub release {tag}")
        notes = cl_notes(version)
        created = gh(
            "release", "create", tag, "--verify-tag", "--title", tag,
            "--notes-file", "-",
            stdin=notes + "\n",
        )
        if not created:
            fail(
                "Couldn't create the GitHub release. Fix the problem above, "
                f"then rerun: just release-finish {version}"
            )

    url = gh("release", "view", tag, "--json", "url", "--jq", ".url", quiet=True).out
    say(f"Released {version}" + (f" — {url}" if url else ""))


def cmd_unrelease(version):
    """Undo a release that never left this machine: drop the tag and release
    commit."""
    tag = tag_of(version)

    if not git("rev-parse", "-q", "--verify", f"refs/tags/{tag}", quiet=True):
        fail(
            f"No local tag {tag} — nothing to unrelease. If files were left "
            "modified, undo with: git checkout -- ."
        )

    remote = git("ls-remote", "--tags", "origin", f"refs/tags/{tag}")
    if not remote:
        fail(f"Couldn't check origin for {tag} — check your network and remote, then rerun.")
    if remote.out:
        fail(
            f"{tag} is already on origin — it's public. Release forward with a "
            "new version instead."
        )

    if git("rev-parse", "HEAD").out != git("rev-parse", f"{tag}^{{commit}}").out:
        fail(
            f"HEAD isn't the {tag} release commit. Undo by hand: git tag -d {tag}, "
            f'then remove the "Release {version}" commit.'
        )
    if git("log", "-1", "--format=%s").out != f"Release {version}":
        fail(f'HEAD isn\'t a "Release {version}" commit. Undo by hand: git tag -d {tag}')

    # --keep refuses rather than discard uncommitted changes.
    if not git("reset", "--quiet", "--keep", "HEAD~1"):
        fail(
            "Couldn't remove the release commit without losing local changes — "
            f"stash them, then rerun: just unrelease {version}"
        )
    git("tag", "-d", tag, quiet=True)
    say(f"Unreleased {version}: deleted {tag} and the release commit.")


COMMANDS = {"release": cmd_release, "finish": cmd_finish, "unrelease": cmd_unrelease}


def main(argv):
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    if len(argv) != 2 or argv[0] not in COMMANDS:
        print(
            "usage: scripts/release.py release | finish | unrelease VERSION",
            file=sys.stderr,
        )
        return 2
    try:
        COMMANDS[argv[0]](argv[1])
    except Fail as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
