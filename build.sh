browserify --standalone nexus-flux -t [ babelify ] -o dist/nexus-flux.js --extension='.js' --extension='.jsx' src/index.jsx --noparse='/home/franzp/nexus-flux/node_modules/lifespan/dist/lifespan.js' \
	--noparse='/home/franzp/nexus-flux/node_modules/remutable/dist/remutable.js' --noparse='/home/franzp/nexus-flux/node_modules/nexus-events/dist/nexus-events.js'
