require('dotenv').config()

const { getLeetCodeStats } = require('./leetcode')
const { Octokit } = require('@octokit/rest')

const {
    GH_TOKEN: github_token,
    GIST_ID: gist_id
} = process.env

const octokit = new Octokit({
    auth: `token ${github_token}`
})

async function main() {
    const leetcode = await getLeetCodeStats()
    await updateLeetCodeGist(leetcode)
}

async function updateLeetCodeGist(leetcode) {
    let gist
    try {
        gist = await octokit.gists.get({
            gist_id
        })
    } catch (error) {
        console.error(
            `leetcode-box cannot resolve your gist:\n${error}`
        )
    }

    const lines = []

    const title = [
        "Difficulty".padEnd(12),
        "Solved".padEnd(10),
        "Accepted Rate".padEnd(8)
    ]
    lines.push(title.join(" "))

    for (let i = 0; i < leetcode.solved.length; i++) {
        const difficulty = leetcode.solved[i].difficulty
        const acceptedRate = leetcode.solved[i].acceptedRate
        const solvedRadio = leetcode.solved[i].solvedRadio

        const line = [
            difficulty.padEnd(12),
            solvedRadio.padEnd(10),
            generateBarChart(acceptedRate, 21),
            String(acceptedRate.toFixed(1)).padStart(5) + "%"
        ]
        lines.push(line.join(" "))
    }

    try {
        const filename = Object.keys(gist.data.files)[0]
        await octokit.gists.update({
            gist_id: gist_id,
            files: {
                [filename]: {
                    filename: `💻 My LeetCode Stats ✨`,
                    content: lines.join("\n")
                }
            }
        })
    } catch (error) {
        console.error(`Unable to update gist\n${error}`)
    }

}

function generateBarChart(percent, size) {
    const syms = "░▏▎▍▌▋▊▉█";

    const frac = Math.floor((size * 8 * percent) / 100);
    const barsFull = Math.floor(frac / 8);
    if (barsFull >= size) {
        return syms.substring(8, 9).repeat(size);
    }
    const semi = frac % 8;

    return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
        .join("")
        .padEnd(size, syms.substring(0, 1));
}

(async() => {
    await main()
})()