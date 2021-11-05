require('dotenv').config();

const axios = require('axios').default;

const {
    LEETCODE_USERNAME: username
} = process.env

const leetcodeURL = 'https://leetcode.com/graphql'

const getOriginalLeetCodeStats = async() => {
    const response = await axios.post(leetcodeURL, {
        query: `
    query getUserProfile($username: String!) {
        allQuestionsCount {
            difficulty
            count
        }
        matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                    submissions
                }
                totalSubmissionNum {
                    difficulty
                    count
                    submissions
                }
            }
        }
    }`,
        variables: {
            username: username
        }
    })
    return response.data.data
}

exports.getLeetCodeStats = async function getLeetCodeStats() {
    const originStat = await getOriginalLeetCodeStats()
    const matchedUser = originStat.matchedUser
    let result = {
        "username": null,
        "solved": []
    }
    if (matchedUser !== null) {
        result.username = matchedUser.username
        for (let i = 0; i < 4; i++) {
            const difficulty = matchedUser.submitStats.acSubmissionNum[i].difficulty
            const accepted = matchedUser.submitStats.acSubmissionNum[i].count
            const allQuestion = originStat.allQuestionsCount[i].count
            const acSubmission = matchedUser.submitStats.acSubmissionNum[i].submissions
            const totalSubmission = matchedUser.submitStats.totalSubmissionNum[i].submissions
            let question = {
                "difficulty": difficulty,
                "acceptedRate": totalSubmission == 0 ? 0.0 : (acSubmission / totalSubmission * 100),
                "solvedRadio": accepted + "/" + allQuestion
            }
            result.solved.push(question)
        }
    }
    return result;
}