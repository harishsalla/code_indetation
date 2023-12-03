const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const db = require("../config/config");
const beautify = require("js-beautify");
const beautifyCSS = require("js-beautify").css;
const beautifyHTML = require("js-beautify").html;
const beautify_c = require("js-beautify").c;
const Display = db.display;
const prettier = require("prettier");
// const prettierCpp = require('prettier/parser-cpp');
// const esprima = require("esprima");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("file uploading");
  const fileBuffer = req.file.buffer;
  const filename = `./${req.file.originalname}`;

  // to write in the file
  fs.writeFile(filename, fileBuffer, (err) => {
    const rows = [];
    const readableStream = fs.createReadStream(filename);

    readableStream
      .pipe(csv())
      .on("data", async (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        res.send(rows);
        for (let value of rows) {
          const new_obj = {
            question: "",
          };
          if (value.QUESTION_TYPE === "HTML") {
            console.log("html");
            try {
              for (let new_value in value) {
                if (new_value === "QUESTION") {
                  // console.log(value.QUESTION, 'TO SEE THE VALUES')
                  const splitted_arr = value.QUESTION.split("----");
                  // console.log(splitted_arr, "splitted_array")
                  let word = "";
                  for (let val of splitted_arr) {
                    new_obj.question = beautifyHTML(val, {
                      indent_size: 4,
                      wrap_line_length: 40,
                    });
                    // console.log(new_obj.question)
                    word += "\n" + new_obj.question;
                  }
                  const data = await Display.create({
                    question: word,
                  });
                }
              }
            } catch (error) {
              console.log(error);
            }
          } else if (value.QUESTION_TYPE === "CSS") {
            console.log("css");
            try {
              for (let new_value in value) {
                if (new_value === "QUESTION") {
                  const splitted_arr = value.QUESTION.split("----");
                  let word = "";
                  for (let val of splitted_arr) {
                    new_obj.question = beautifyCSS(val, {
                      indent: "    ",
                      autosemicolan: true,
                    });
                    word += "\n" + new_obj.question;
                  }
                  const data = await Display.create({
                    question: word,
                  });
                }
              }
            } catch (error) {
              console.log(error, "error");
            }
          } else if (value.QUESTION_TYPE === "JAVASCRIPT") {
            console.log("javascript");
            try {
              for (let new_value in value) {
                if (new_value === "QUESTION") {
                  const splitted_arr = value.QUESTION.split("----");
                  let word = "";
                  for (let val of splitted_arr) {
                    new_obj.question = beautify(val, {
                      indent: 2,
                      space_in_empty_paren: false,
                    });
                    word += "\n" + new_obj.question;
                  }
                  const data = await Display.create({
                    question: word,
                  });
                }
              }
            } catch (error) {
              console.log(error, "error in js");
            }
          } else if (value.QUESTION_TYPE === "PYTHON") {
            console.log("python");
            try {
              for (let new_value in value) {
                console.log("first point");
                if (new_value === "QUESTION") {
                  console.log("inside if");
                  const splittedArr = value.QUESTION.split("----");
                  let word = "";

                  for (const val of splittedArr) {
                    try {
                        const { stdout, stderr } = await exec(
                            `echo ${val} | black --line-length 79 -`
                          );

                      if (stderr) {
                        throw new Error(`Error : ${stderr}`);
                      }

                      const formattedCode = stdout;
                      console.log(formattedCode, "python formatted code");

                      word += "\n" + formattedCode;
                    } catch (error) {
                      console.log(`Error formatting python code: ${error}`);
                    }
                  }

                  console.log(word, "pythons");

                  const data = await Display.create({
                    question: word,
                  });
                } 
              }
            } catch (error) {
              console.error("Error in the main try-catch block:", error);
            }
          }
          // else if (value.QUESTION_TYPE === "CPP") {
          //     console.log("python")
          //     try {
          //         for (let new_value in value) {
          //             if (new_value === "QUESTION") {
          //                 const splitted_arr = value.QUESTION.split("----")
          //                 let word = ""
          //                 for (let val of splitted_arr) {
          //                     console.log(val)

          //                     new_obj.question=await  prettier.format(val, { parser: 'cpp',semi: false, // Example: Configure Prettier options
          //                     singleQuote: true });
          //                     word += "\n" + new_obj.question
          //                 }
          //                 console.log(word)
          //                 const data = await Display.create({
          //                     question: word
          //                 })

          //             }
          //         }
          //     }
          //     catch (error) {
          //         console.log(error, 'error in js')
          //     }
          // }
        }
      });
  });
}); // <-- Added the closing bracket for the /upload route

router.get("/getallusers", async (req, res) => {
  try {
    const allValue = await Display.findAll({});
    res.status(200).json({ value: allValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
