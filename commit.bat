@echo off
set path=C:\Program Files\Git\bin


git add .

set /p str=Input description:
echo description: "%str%"

git commit -m "%str%"
git status
git config --list

git remote add origin https://github.com/janghunduck/jsparser.git
git pull origin master
git push origin master



pause