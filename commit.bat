@echo off
set path=C:\Program Files\Git\bin


git add .

set /p str=Input description:
echo description: "%str%"
git commit -m "%str%"
git status

echo  ==================== git cconfig ==========================
git config --list

git remote add origin https://github.com/janghunduck/jsparser.git
rem master is this(노예) so, change main.
rem git pull origin master
git push origin master



pause