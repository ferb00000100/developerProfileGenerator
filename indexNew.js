const inquirer = require("inquirer");
const axios = require("axios");
const util = require("util");
const fs = require("fs");
const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);

// TODO find git hub Blog API
//

function writePDF(){
	const puppeteer = require('puppeteer');

	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto('index.html', {waitUntil: 'networkidle2'});
		await page.pdf({path: 'hn.pdf', format: 'A4'});

		await browser.close();
	})();

}


function generateHTML(gitUser, repoCount, numberOfFollowing, numberOfFollowers, numberOfStarredRepos, gitLink, myName, locationLink, linkedInLink, twitterLink, instagramLink) {
	return `
<!doctype html>
<html class="no-js" lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${myName}</title>
	<link rel="stylesheet" href="https://dhbhdrzi4tiry.cloudfront.net/cdn/sites/foundation.min.css">
	<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="off-canvas-wrapper">
	<div class="off-canvas-wrapper-inner" data-off-canvas-wrapper>
		<div class="off-canvas position-left reveal-for-large" id="my-info" data-off-canvas data-position="left">
			<div class="row column">
				<br>
				<img class="thumbnail" src="profile_pic.jpg">
				<h5>${myName}</h5>
			</div>
		</div>
	<div class="off-canvas-content" data-off-canvas-content>
		<div class="title-bar hide-for-large">
			<div class="title-bar-left">
			<button class="menu-icon" type="button" data-open="my-info"></button>
			<span class="title-bar-title">${myName}</span>
		</div>
	</div>
	<div class="callout primary">
		<div class="row column">
			<h1>Hello! My name is ${myName}</h1>
			<h6>Git User Name: ${gitUser}</h6>
		</div>
	</div>
	<div class="row small-up-2 medium-up-3 large-up-4">
		<div class="column">
			<img class="thumbnail" src="github_image.png">
			<a href="${gitLink}">My GitHub</a>
		</div>
		<div class="column">
			<img class="thumbnail" src="maps_512dp.png">
			<a href="${locationLink}">Living in Littleton!</a>
		</div>
		<div class="columns">
<!--		<div class="column">-->
			<ul>
				<li>I have ${repoCount} repositories in my GitHub account.</li>
				<li>I have ${numberOfFollowers} followers of GitHub account.</li>
				<li>I am following ${numberOfFollowing} GitHub users.</li>
				<li>I have ${numberOfStarredRepos} starred repositories in my GitHub account.</li>
			</ul>
		</div>
	</div>
	<hr>
	<div class="row">
		<div class="medium-6 columns">
			<h3>Contact Me</h3>
			<p>You can follow me on Instagram, LinkedIn and Twitter</p>
			<ul class="menu">
				<li><a href="${linkedInLink}">LinkedIn</a></li>
				<li><a href="${twitterLink}">Twitter</a></li>
				<li><a href="${instagramLink}">Instagram</a></li>
			</ul>
		</div>
	<div class="medium-6 columns">
		<label>Name
			<input type="text" placeholder="Name">
		</label>
		<label>Email
			<input type="text" placeholder="Email">
		</label>
		<label> Message
			<textarea placeholder="what's on your mind!"></textarea>
		</label>
			<input type="submit" class="button expanded" value="Submit">
	</div>
</div>
</div>
</div>
</div>
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script src="https://dhbhdrzi4tiry.cloudfront.net/cdn/sites/foundation.js"></script>
<script>
$(document).foundation();
</script>
</body>
</html>
`;
}

// TODO Add repo count to html and format PDF

function gitHubData(userName) {
	const gitUser = userName.username;
	const myName = "Jason Martin";
	const gitLink ="https://github.com/"+gitUser+"?tab=repositories"
	const locationLink = "https://www.google.com/maps/d/u/0/viewer?ie=UTF8&hl=en&msa=0&ll=39.61520999999999%2C-104.99908399999998&spn=0.158686%2C0.205994&z=11&source=embed&mid=1_6SMyOGhQ6NzZ_PPkQx2opn4m_g";
	const linkedInLink = "https://www.linkedin.com/in/jason-martin-8a19583/";
	const twitterLink = "https://twitter.com/jmart004";
	const instagramLink = "https://www.instagram.com/jmart00000100/?hl=en";

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

			const html = generateHTML(gitUser, repoCount, numberOfFollowing, numberOfFollowers, numberOfStarredRepos, gitLink, myName, locationLink, linkedInLink, twitterLink, instagramLink);
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
		await writePDF();

	} catch(err) {
		console.log(err);
	}
}

init();
