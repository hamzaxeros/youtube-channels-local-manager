const {
	exit,
	listOnlyHidden,
	list,
	videoSorter,
	symbols,
} = require("./../util/index");
const {
	GIT_YOUTUBE_DIR_FULL,
	GIT_YOUTUBE_DIR_NAME,
	YOUTUBE_DIR_FULL,
} = require("../global");
const shell = require("shelljs");
const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");

module.exports.getBuildGithub = () => {
	if (shell.exec("git --version").stderr !== "") {
		console.log(
			symbols().error,
			"We didn't found ",
			chalk.greenBright("git"),
			" command in your machine, ",
			chalk.white('Please install "git".')
		);
		console.log("\n", chalk.greenBright("Good Bye"), " 👍\n");
		process.exit(1);
	}
	if (
		listOnlyHidden(process.env.HOME).includes(GIT_YOUTUBE_DIR_NAME) ===
		false
	) {
		shell.mkdir(GIT_YOUTUBE_DIR_FULL);
	}
	shell.cd(GIT_YOUTUBE_DIR_FULL);

	// Ask questions about github
	console.log("\n");
	inquirer
		.prompt([
			{
				type: "input",
				name: "commit",
				message: 'Type a "commit" message for github repo: ',
				default: "🆙 : All resources are upto date!",
			},
			{
				type: "input",
				name: "branch",
				message: "Type your branch name: ",
				default: "main",
				when: !listOnlyHidden().includes(".git"),
			},
			{
				type: "input",
				name: "remote",
				message:
					"Type / Paste your github remote URL: " +
					chalk.red(
						"Becarefull to pass the correct remote, otherwise you may not be able to change it "
					),
				when: !listOnlyHidden().includes(".git"),
				default:
					"Exit me! < Actually it will exit the app if you didn't pass the remote URL. >",
			},
		])
		.then((answer) => {
			if (
				answer.remote ===
				"Exit me! < Actually it will exit the app if you didn't pass the remote URL. >"
			) {
				console.log("You didn't pass the remote URL, Program Exited.");
				console.log("\n", chalk.greenBright("Good Bye"), " 👍\n");
				process.exit(1);
			} else {
				if (!listOnlyHidden().includes(".git")) {
					shell.exec("git init");
				}
				shell.exec(`git add .`);
				shell.exec(`git commit -m \"${answer.commit}\"`);
				shell.exec(`git branch -M \"${answer.branch}\"`);
				if (
					shell.exec(`git remote add origin ${answer.answer.remote}`)
						.stderr !== ""
				) {
					console.clear();
					shell.rm("-rf", ".git");
					console.log(
						symbols().error,
						"Remote URL was wrong, Try to do it again."
					);
					process.exit(1);
				}
				shell.exec(`git push --all`);
			}
		});

	// Copy all files locally
	if (listOnlyHidden().includes(".gitignore") === false) {
		shell.touch(".gitignore");
		shell
			.cat(path.join(__dirname, "templates/gitignore.txt"))
			.to(".gitignore");
	}
	const allChannelsLists = list(YOUTUBE_DIR_FULL);
	allChannelsLists.map((channel, i) => {
		if (list(GIT_YOUTUBE_DIR_FULL).includes(channel) === false) {
			shell.mkdir(channel);
		}
		const allVideoOfThisChannel = videoSorter(
			path.join(YOUTUBE_DIR_FULL, channel, "Tutorials"),
			false
		);
		allVideoOfThisChannel.map((video, i) => {
			if (list(channel).includes(video.name) === false) {
				shell.mkdir(path.join(channel, video.name));
			}
			shell.cp(
				"-rf",
				`${path.join(
					YOUTUBE_DIR_FULL,
					channel,
					"Tutorials",
					video.value,
					"CODE",
					"*"
				)}`,
				`${path.join(channel, video.name)}`
			);
		});
	});
	// Lets upload to github;
};
