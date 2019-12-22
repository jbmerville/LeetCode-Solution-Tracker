# LeetCode-Solution-Tracker
Track your LeetCode solutions in one command line!
## Getting Started
1. Clone the project.
2. Run `npm install`
3. Get the leetcode cookie through the Chrome browser: go on [leetcode](www.leetcode.com), make sure you are logged in. Inspect element anywhere on a page (Ctrl + Shift + I).
Select the `network` tab, then reload the page. Select the first request (should be named: `leetcode.com`) look in the `header` section copy the `cookie` into config.json.
4. Add the absolute path where the solutions will be located to config.json.
5. Add your name to config.json.
6. Run `node tracker.js https://leetcode.com/problems/a-leetcode-problem-url/`


