const { Project, SyntaxKind } = require("ts-morph");
const path = require("path");
const fs = require("fs");

async function main() {
  const project = new Project();
  project.addSourceFilesAtPaths("src/modules/**/*.ts");

  let filesModified = 0;

  for (const sourceFile of project.getSourceFiles()) {
    let hasChanges = false;
    
    const catchClauses = sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause);
    
    for (const catchClause of catchClauses) {
      // Find enclosing function
      const func = catchClause.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
                   catchClause.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
                   catchClause.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
                   
      let funcName = "Unknown";
      if (func && func.getKind() === SyntaxKind.FunctionDeclaration) {
        funcName = func.getName() || "Unknown";
      } else if (func && func.getKind() === SyntaxKind.MethodDeclaration) {
        funcName = func.getName() || "Unknown";
      } else if (func && func.getKind() === SyntaxKind.ArrowFunction) {
        const varDecl = func.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
        if (varDecl) funcName = varDecl.getName();
      }
      
      // Module name
      const moduleName = path.basename(path.dirname(sourceFile.getFilePath()));
      const location = `${moduleName}.${funcName}`;
      
      const block = catchClause.getBlock();
      
      // We only want to replace if it currently has a return res.status(xxx) or if it's returning json
      const blockText = block.getText();
      if (blockText.includes("res.status") || blockText.includes("res.json") || blockText.includes("return res")) {
        const errorParamName = catchClause.getVariableDeclaration()?.getName() || "error";
        block.replaceWithText(`{\n    return handleError(res, ${errorParamName}, "${location}");\n  }`);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      // Add import
      const hasImport = sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue().endsWith("error-handler"));
      if (!hasImport) {
        // Find relative path from this file to src/utils/error-handler
        const fileDir = path.dirname(sourceFile.getFilePath());
        const utilsDir = path.resolve(process.cwd(), "src/utils");
        let relPath = path.relative(fileDir, utilsDir).replace(/\\/g, "/");
        if (!relPath.startsWith(".")) relPath = "./" + relPath;
        
        sourceFile.addImportDeclaration({
          namedImports: ["handleError"],
          moduleSpecifier: `${relPath}/error-handler`
        });
      }
      filesModified++;
    }
  }

  await project.save();
  console.log(`Refactored ${filesModified} files.`);
}

main().catch(console.error);
