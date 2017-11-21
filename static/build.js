var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var postcss = require("postcss");
var postcss_cssnext = require("postcss-cssnext");

browserify({ debug: true })
  .transform(babelify.configure({
    presets: [
      ['env', {
        "targets": {
          "browsers": ["last 3 versions"]
        }
      }]
    ]
  }))
  .require("./index.js", { entry: true })
  .bundle()
  .on("error", function (err) { console.log("Error: " + err.message); })
  .pipe(fs.createWriteStream("bundle.js"));


const cssFiles = [ 
  { path: './viz/macroViz.css', name: 'macroViz.css'}, 
  { path: './viz/microViz.css', name: 'microViz.css'}, 
  { path: './style.css', name: 'style.css'}, 
  { path: './highlighting.css', name: 'highlighting.css'}, 
];
cssFiles.forEach(file => {
  const out = 'dist/'+file.name;
  fs.readFile(file.path, (err, css) => {
    postcss([postcss_cssnext])
      .process(css, { from: file.path, to: out })
      .then(result => {
          fs.writeFile(out, result.css, function (err) {
            if (err) throw err;
            console.log('The file has been saved!');
          });

          if ( result.map ) {
            fs.writeFile(out+'.map', result.map, function (err) {
              if (err) throw err;
              console.log('The file has been saved!');
            });
          }
      });
  });
});