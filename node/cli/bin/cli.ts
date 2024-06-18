#!/usr/bin/env -S npx tsx

import { Command } from "commander";
import subcommand1 from "./subcommand1";

const program = new Command();

program
  .command("subcommand1")
  .description("What subcommand1 does")
  .action(subcommand1);

program.parse();

