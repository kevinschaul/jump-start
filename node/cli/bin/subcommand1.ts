import { OptionValues, Command } from "commander";

export default async function (opts: OptionValues, command: Command) {
  console.log("Running subcommand1");
  console.log("opts: ", opts);
}
