const request = require('request');
const fs = require('fs');
const { name, cookie, path } = require('./config.json');
const languages = require('./languages-map.json');

const url = process.argv[2];
const apiSumbissionsUrl = 'https://leetcode.com/api/submissions/';
const apiAlgorithmsUrl = 'https://leetcode.com/api/problems/algorithms/';
const leetcodeUrl = 'https://leetcode.com/problems/';


// Get the code from the last successful submission for a problem.
const getSubmissionInfo = (url) => request(
	{
		url: apiSumbissionsUrl +  url.replace(leetcodeUrl, ''),
		headers: {
			Cookie: cookie,
		},
		method: 'GET'
	},  
	async (err, res, body) => {
		if (err) {
			console.error('Request failed with error: ' + err);
		} else {
			const submissions = JSON.parse(body).submissions_dump;
			for (let i  = 0; i < submissions.length; i++){
				if (submissions[i].status_display === 'Accepted') {
					const { code, title, lang } = submissions[i];
					getProblemInfo({ code, title, lang });
					return;
				}
			}
			console.error('No submissions found for: ' + url);
		} 
	}
);

// Get info about the problem code.
const getProblemInfo = (data) => request(
	{
		url: apiAlgorithmsUrl,
		headers: {
			Cookie: cookie,
		},
		method: 'GET'
	}, async (err, res, body) => {
		if (err) {
			console.error('Request failed with error: ' + err);
		} else {
			const problems = JSON.parse(body).stat_status_pairs;
			problems.forEach(problem => {
				if (problem.stat.question__title ==  data.title){
					data.difficulty = getDifficulty(problem.difficulty.level);
					writeToFile(data);
					return;
				}
			});
		}
	}
);

const getDifficulty = difficulty => {
	switch (difficulty) {
	case 1:
		return 'Easy';
	case 2:
		return 'Medium';
	case 3:
		return 'Hard';
	default:
		return 'Unknown';
	}
};

const getLanguage = (lang) => {
	if (!(lang in languages)) {
		console.error(`Language ${lang} not in /languages-map.json. Please update /languages-map.json`);
	}
	return languages[lang];
};


// Writes to both the submissions file and the problem file.
const writeToFile = (data) => {
	const { code, lang, difficulty } = data;
	const { extension, comment } = getLanguage(lang);
	const trimedCode = code.trim();
	const submission = `\n\n${comment} ${name} - ${url} - ${difficulty}\n ${trimedCode}`;
	fs.appendFile(path + `Submissions.${extension}`, submission, (err) => {
		if (err) throw err;
		console.log('Saved!');
	});
	fs.readFile(path + 'problems.json', (err, problems) => {
		problems = JSON.parse(problems);
		problems.push(url);
		fs.writeFile(path + 'problems.json', JSON.stringify(problems), (err) => {
			if (err) throw err;
		});
	});
};

// Check if the solution is already present in the submissions file.
const isSubmissionsPresent = (url) => {
	if (fs.existsSync(path + 'problems.json')) {
		const data = fs.readFileSync(path + 'problems.json');
		const problems = JSON.parse(data);
		return problems.includes(url);
	} else {
		fs.writeFile(path + 'problems.json', '[]', (err) => {
			if (err) throw err;
			return false;
		});
	}
};

if (!cookie) {
	console.error('Please provide your cookie in "config.json"!');
} else if (!name) {
	console.error('Please provide your name in "config.json"!');
} else if (!path) {
	console.error('Please provide a path in "config.json"!');
} else if (!fs.existsSync(path)) {
	console.error('Invalid path: '+ path);
} else if (!isSubmissionsPresent(url)) {
	getSubmissionInfo(url);
} else {
	console.error('Solution already saved');
}
