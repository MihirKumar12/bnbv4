
const Schema = require('mongoose');
({
RefLeaderBoard: async function (showlist) {
        try {
            var data = await find({}).sort({ ref_count : -1 }).limit(showlist)
            return (data) ? data : false
        } catch (error) {
            return false
        }
    }})
module.exports = 'userinfoSchema'