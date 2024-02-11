#!/usr/bin/env bash

cd "$(dirname "$0")/.." || exit 1


log() 
{
    if [ "$2" = "-n" ]; then
	printf "[submit] %s" "$1"
    else
	printf "[submit] %s\n" "$1"
    fi
}

[[ ! -x "$(command -v zip)" ]] && log "zip not found, please install it" && exit 1
[[ ! -x "$(command -v git)" ]] && log "git not found, please install it" && exit 1

# Check if we are in a git repository
git ls-files > /dev/null || exit 1

cd "$(dirname "$0")/.." || exit 1

SUBMISSION_FOLDER="submission"
ROOT_FOLDER=javascript
SRC_FOLDER="$ROOT_FOLDER/src/main"
TARGET_FOLDER="$SUBMISSION_FOLDER/$SRC_FOLDER"

log "creating submission..."

[ -d $SUBMISSION_FOLDER ] && rm -r $SUBMISSION_FOLDER
mkdir -p "$SUBMISSION_FOLDER"

git ls-files | while IFS='' read -r file
do 
    mkdir -p $TARGET_FOLDER/"$(dirname "$file")"
    cp "$file" $TARGET_FOLDER/"$(dirname "$file")"

done

# Ask the user if they want to overwrite the submission.zip file
[[ -f submission.zip ]] && log "overwrite submission.zip? (y/n) " -n & read -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] && rm submission.zip
[[ $REPLY =~ ^[Nn]$ ]] && exit 1

cd $SUBMISSION_FOLDER || exit 1

zip ../submission.zip -r $ROOT_FOLDER > /dev/null

cd .. || exit 1

[[ -f submission.zip ]] || ( log "submission.zip could not be created" && exit 1 )

# Ask the user if they want to keep the submission folder
log "remove submission folder? (y/n) " -n & read -n 1 -r && echo
[[ $REPLY =~ ^[Yy]$ ]] && rm -r $SUBMISSION_FOLDER
[[ $REPLY =~ ^[Nn]$ ]] && exit 1

log "created submission: submission.zip"
log "you can now upload it to autograder!"
