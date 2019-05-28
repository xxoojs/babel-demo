const healperImport = require("@babel/helper-module-imports");

let ImportPlugin = {
    libName: '',
    libDir: '',
    toImportQueue: [],
    importedQueue: {},
    import: function(path, file){
        for(let prop in this.toImportQueue){
            if(this.toImportQueue.hasOwnProperty(prop)){
                // return healperImport.addNamed(file.path, prop, `./${this.libName}/${this.libDir}/${prop}.js`);
                let imported = healperImport.addDefault(file.path, `./${this.libName}/${this.libDir}/${prop}.js`);
                this.importedQueue[prop] = imported;
                return imported;
            }
        }
    }
};

module.exports = function ({ types }) {
    return {
        visitor: {
            Program: {
                enter(path, { opts = {} }) {
                    ImportPlugin.libName = opts.libName;
                    ImportPlugin.libDir = opts.libDir;
                }
            },
            ImportDeclaration: {
                enter(path, state){
                    const { node, hub: { file } } = path;
                    if (!node) return;
                    const { value } = node.source;
            
                    if (value === ImportPlugin.libName) {
                        node.specifiers.forEach(spec => {
                            ImportPlugin.toImportQueue[spec.local.name] = spec.local.name;
                        });
                        path.remove();
                        ImportPlugin.import(path, file);
                    }
                }
            },
            Identifier(path){
                if(ImportPlugin.importedQueue[path.node.name]){
                    path.replaceWith(ImportPlugin.importedQueue[path.node.name]);
                }
            }
        }
    }
}