
# Description

This program will export the [taskwarrior](https://github.com/GothenburgBitFactory/taskwarrior) results into a markdown table.

# Installation

```sh
git clone https://github.com/gkssjovi/taskmd.git
cd taskmd
yarn 
chmod +x ./src/main.js
ln -s $PWD/src/main.js /usr/local/bin/taskmd
```

If you want to use a config file

```sh
mkdir ~/.config/taskmd/

ln -s $PWD/config.yaml ~/.config/taskmd/config.yaml 
```

# Usage

The output will be copied in your clipboard
```sh

taskmd --help

taskmd project:Inbox status:pending 
taskmd project:Inbox status:pending > output.md
taskmd project:Inbox status:pending --copy false
taskmd project:Inbox status:pending --copy false | pbcopy
taskmd project:Inbox status:pending --columns id,st,time,p,project,due,decription,total
taskmd project:Inbox status:pending --format-annotation='*%s*' --format-description='**%s**'
```

# Output

```sh
| ID | St      | Age | Time    | P | Project | Tags | Due | Description                                                                      | Urg      |
|----|---------|-----|---------|---|---------|------|-----|----------------------------------------------------------------------------------|----------|
| 3  | pending | 7d  | 1:35:46 | L | Inbox   | tag  |     | Support / Other related work                                                     | -13.0616 |
| 5  | pending | 2d  | 0:47:06 | L | Inbox   | tag2 |     | Add select department to the warranty list in the front-office                   | -13.089  |
| 6  | pending | 2d  | 1:36:49 | L | Inbox   | tag3 |     | Remove the send message button, and move the message box the right of the screen | -13.089  |
| 7  | pending | 2d  | 0:43:18 | L | Inbox   | tag  |     | Add department as subject when a message is sent                                 | -13.089  |
| 8  | pending | 2d  | 0:22:48 | L | Inbox   | tag  |     | Veify sending message error in the front-office                                  | -13.089  |
| 9  | pending | 2d  | 0:12:12 | L | Inbox   | tag3 |     | Fix the categories layout in the front-office, put six products per line         | -13.089  |
| 10 | pending | 1d  | 0:27:42 | L | Inbox   | tag  |     | Add department on message in the back-office                                     | -13.0945 |
```



