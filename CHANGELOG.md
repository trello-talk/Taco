# CHANGELOG.md

## Unreleased
- Fix `undefined` usage in help command

## v6.4.1
- Fix `remwebhook` command usage
- Fix `remwebhook` erroring if the internal webhook was deleted but our the webhook was still in our database

## v6.4.0
- Comment out botlists by default, this means that you don't get 401 unauthorized errors by not filling in the config
- Fix a couple of bugs around the multiple usages ability
- Fix `serverivite` command crashing when it was run
- Add mute/unmute feature (See more info in our discord support server: https://trellobot.xyz/server)

## v6.3.1
- Hotfix for incorrect usage for `addwebhook`

## v6.3.0
- NOTE: I apologise that these commits are a bit messed up, I didn't understand how git rebase worked
- Change changelog order 😅
- `exec` now returns both STDOUT/STDERR together, i.e. for a `git pull` commmand
- Typo fixed in `info`
- Fix `remwebhook` crashing on an invalid board
- [DEV] Update command format to support multiple usages
- Botlist support is here!! 🤖🤖
- `unhandledRejection` errors are now logged to console

## v6.2.0
- `addwebhook` now allows a trello board url instead of a short link (board id)
- `addwebhook` now strips extra information from the end of a webhook url, i.e. `/github` on the end of a webhook
- The timeout for pagination reactions has been increased from 10 seconds to 30 seconds

## v6.1.0
- Fix typo in changelog 🤔
- Add aeval command (`T!aeval`)
- Make errors more descriptive in addwebhook
- Update remwebhook so that it actually deletes internal webhooks as well
- Add LICENSE file and update README.md

## v6.0.1
- Hotfix for webhooks not working

## v6.0.0
- Another breaking change 😒
- Config files are neater, and now you don't need to edit the actual bot files for links, this is done in Config/links.js

## v5.0.0
- Change branding
- Create a changelog
