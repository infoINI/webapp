publish:
	rsync -rv --exclude='.git*' --delete ./build/ root@infoini.de:/local/webapp/
