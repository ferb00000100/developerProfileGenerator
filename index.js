const inquirer = require("inquirer");
const axios = require("axios");
const util = require("util");
const fs = require("fs");
const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);


// TODO find git hub Blog API
//

function generateHTML(gitUser, repoCount, numberOfFollowing, numberOfFollowers, numberOfStarredRepos) {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		  <meta charset="UTF-8">
		  <meta http-equiv="X-UA-Compatible" content="ie=edge">
		  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
		  <link rel="stylesheet" href="style.css">
		  <title>Jason Martin (ferb00000100)</title>
		</head>
		<body>
		  <div class="jumbotron jumbotron-fluid">
		  <div class="container">
		    <h1 class="display-4">Hi! My name is ${gitUser}</h1>
		    <p class="lead">I have ${repoCount} repositories in my GitHub account.</p>
   		    <p class="lead">I have ${numberOfFollowers} followers of GitHub account.</p>
 		    <p class="lead">I am following ${numberOfFollowing} GitHub users.</p>
		    <p class="lead">I have ${numberOfStarredRepos} starred repositories in my GitHub account.</p>
		    <h3>Example heading <span class="badge badge-secondary">Contact Me</span></h3>
		    <ul class="list-group">
		      <li class="list-group-item">My GitHub username is ${gitUser}</li>
		      <li class="list-group-item">LinkedIn:</li>
		    </ul>
		  </div>
		</div>
		</body>
		</html>`;
}

// TODO Add repo count to html and format PDF

function gitHubData(userName) {
	const gitUser = userName.username;
	axios.all([
		axios.get("https://api.github.com/users/"+gitUser+"/repos?per_page=100"),
		axios.get("https://api.github.com/users/"+gitUser+"/following"),
		axios.get("https://api.github.com/users/"+ gitUser+"/followers"),
		axios.get("https://api.github.com/users/"+gitUser+"/starred")
	])
	.then(responseArray => {
		let repositories = responseArray[0].data;
		const repoNames = repositories.map(function (repo) {
			return repo.name;
		});
		let repoCount = repoNames.length;
		appendFileAsync(gitUser+".pdf",repoCount);
		// console.log("Reps " + repoNames);

		let usersFollowing = responseArray[1].data;
		const following = usersFollowing.map(function (following) {
			return following.login;
		});
		let numberOfFollowing = following.length;
		appendFileAsync(gitUser+".pdf",numberOfFollowing);
		// console.log(following);
		// console.log("Number Following " + numberOfFollowing);

		let userfollowers = responseArray[2].data;
		const followers = userfollowers.map(function (followers) {
			return followers.login;
			});
		let numberOfFollowers = followers.length;
		appendFileAsync(gitUser+".pdf",numberOfFollowers);
		// console.log(following);
		// console.log("Number of Followers " + numberOfFollowers);

		let starredRepos = responseArray[2].data;
		const starred = starredRepos.map(function (starred) {
			return starred;
			});
		let numberOfStarredRepos = starred.length;
		appendFileAsync(gitUser+".pdf",numberOfStarredRepos);
		// console.log("Number of stars " + starred.length);

		const html = generateHTML(gitUser, repoCount, numberOfFollowing, numberOfFollowers, numberOfStarredRepos);
		writeFileAsync("index.html", html);
		});
}


function getUserName() {

	return inquirer.prompt(
		{
			type: "input",
			name: "username",
			message: "What is your GitHub Username"
		});
}

function getColor() {

	return inquirer.prompt(
		{
		type: "input",
		name: "color",
		message: "What is your favorite color"
		});
}

function generateCSS(bgColor) {
	return`
	body {
		background-color: ${bgColor.color};
	}`;
}
async function init() {
	try {
		const bgColor = await getColor();
		const userName = await getUserName();
		const css = generateCSS(bgColor);

		await writeFileAsync("style.css", css);

		gitHubData(userName);


	} catch(err) {
		console.log(err);
	}
}

init();
