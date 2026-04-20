// const JUDGE0_URL = "https://ce.judge0.com";

// const LANGUAGE_IDS = {
//   javascript: 63,
//   typescript: 74,
//   python: 71,
//   java: 62,
//   c: 50,
//   cpp: 54,
//   csharp: 51,
//   go: 60,
//   rust: 73,
//   php: 68,
//   ruby: 72,
//   swift: 83,
//   kotlin: 78,
//   bash: 46,
// };

// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// const fixCode = (code, language) => {
//   // ✅ Step 1 — Escaped characters fix karo
//   let fixed = code
//     .replace(/\\"/g, '"')
//     .replace(/\\n/g, '\n')
//     .replace(/\\t/g, '\t')
//     .replace(/\\\\/g, '\\');

//   // ✅ Step 2 — Language specific fixes
//   switch (language) {

//     case "java":
//       // Class name Main hona chahiye
//       fixed = fixed.replace(/public class \w+/g, "public class Main");
//       break;

//     case "cpp":
//     case "c":
//       // #include ke baad newline
//       fixed = fixed
//         .replace(/#include\s*<([^>]+)>\s*/g, '#include <$1>\n')
//         .replace(/#include\s*"([^"]+)"\s*/g, '#include "$1"\n')
//         .replace(/using namespace std;\s*/g, 'using namespace std;\n');
//       break;

//     case "python":
//       // Python mein semicolons ko newlines mein convert karo
//       // (jab AI ek line mein sab likhta hai)
//       if (!fixed.includes('\n')) {
//         fixed = fixed
//           .replace(/;\s*/g, '\n')
//           .replace(/def /g, '\ndef ')
//           .replace(/class /g, '\nclass ');
//       }
//       break;

//     case "javascript":
//     case "typescript":
//       // \" fix already upar ho gaya
//       break;

//     case "csharp":
//       // C# class name fix
//       fixed = fixed.replace(/public class \w+/g, "public class Main");
//       // Namespace ensure karo
//       if (!fixed.includes("using System")) {
//         fixed = "using System;\n" + fixed;
//       }
//       break;

//     case "go":
//       // Go package main ensure karo
//       if (!fixed.includes("package main")) {
//         fixed = "package main\n\n" + fixed;
//       }
//       // import fmt ensure karo
//       if (fixed.includes("fmt.") && !fixed.includes("import")) {
//         fixed = fixed.replace("package main", 'package main\n\nimport "fmt"');
//       }
//       break;

//     case "rust":
//       // fn main ensure karo
//       if (!fixed.includes("fn main")) {
//         fixed = fixed + "\nfn main() {}";
//       }
//       break;

//     case "php":
//       // PHP opening tag ensure karo
//       if (!fixed.startsWith("<?php")) {
//         fixed = "<?php\n" + fixed;
//       }
//       break;

//     case "ruby":
//       // Ruby semicolons to newlines
//       if (!fixed.includes('\n')) {
//         fixed = fixed.replace(/;\s*/g, '\n');
//       }
//       break;

//     case "swift":
//       // Swift import Foundation ensure karo
//       if (!fixed.includes("import Foundation") && !fixed.includes("import Swift")) {
//         fixed = "import Foundation\n" + fixed;
//       }
//       break;

//     case "kotlin":
//       // Kotlin fun main ensure karo
//       fixed = fixed.replace(/public class \w+/g, "");
//       if (!fixed.includes("fun main")) {
//         fixed = fixed + "\nfun main() { println(\"Done\") }";
//       }
//       break;

//     case "bash":
//       // Bash shebang ensure karo
//       if (!fixed.startsWith("#!/")) {
//         fixed = "#!/bin/bash\n" + fixed;
//       }
//       break;

//     default:
//       break;
//   }

//   return fixed;
// };

// export const runCode = async (code, language, stdin = "") => {
//   // HTML, CSS, SQL, JSON, YAML, Markdown run nahi ho sakte
//   const nonExecutable = ["html", "css", "sql", "json", "yaml", "markdown"];
//   if (nonExecutable.includes(language)) {
//     return {
//       output: "",
//       error: `${language.toUpperCase()} code execute nahi ho sakta!`,
//       status: "Not Supported",
//       time: null,
//       memory: null,
//     };
//   }

//   const languageId = LANGUAGE_IDS[language];
//   if (!languageId) {
//     return {
//       output: "",
//       error: `${language} language supported nahi hai!`,
//       status: "Not Supported",
//       time: null,
//       memory: null,
//     };
//   }

//   // ✅ Code fix karo
//   const finalCode = fixCode(code, language);

//   const submitRes = await fetch(
//     `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         source_code: finalCode,
//         language_id: languageId,
//         stdin: stdin,
//       }),
//     }
//   );

//   const { token } = await submitRes.json();
//   if (!token) throw new Error("Submission failed");

//   let attempts = 0;
//   while (attempts < 10) {
//     await delay(1000);
//     const resultRes = await fetch(
//       `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`
//     );
//     const result = await resultRes.json();

//     if (result.status?.id <= 2) {
//       attempts++;
//       continue;
//     }

//     return {
//       output: result.stdout || "",
//       error: result.stderr || result.compile_output || "",
//       status: result.status?.description || "Unknown",
//       time: result.time,
//       memory: result.memory,
//     };
//   }

//   throw new Error("Execution timeout");
// };





const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  csharp: 51,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  swift: 83,
  kotlin: 78,
  bash: 46,
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fixCode = (code, language) => {
  let fixed = code
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');

  switch (language) {
    case "java":
      fixed = fixed.replace(/public class \w+/g, "public class Main");
      break;

    case "cpp":
    case "c":
      fixed = fixed
        .replace(/#include\s*<([^>]+)>\s*/g, '#include <$1>\n')
        .replace(/#include\s*"([^"]+)"\s*/g, '#include "$1"\n')
        .replace(/using namespace std;\s*/g, 'using namespace std;\n');
      break;

    case "python":
      if (!fixed.includes('\n')) {
        fixed = fixed
          .replace(/;\s*/g, '\n')
          .replace(/def /g, '\ndef ')
          .replace(/class /g, '\nclass ');
      }
      break;

    case "csharp":
      fixed = fixed.replace(/public class \w+/g, "public class Main");
      if (!fixed.includes("using System")) {
        fixed = "using System;\n" + fixed;
      }
      break;

    case "go":
      if (!fixed.includes("package main")) {
        fixed = "package main\n\n" + fixed;
      }
      if (fixed.includes("fmt.") && !fixed.includes("import")) {
        fixed = fixed.replace("package main", 'package main\n\nimport "fmt"');
      }
      break;

    case "rust":
      if (!fixed.includes("fn main")) {
        fixed = fixed + "\nfn main() {}";
      }
      break;

    case "php":
      if (!fixed.startsWith("<?php")) {
        fixed = "<?php\n" + fixed;
      }
      break;

    case "ruby":
      if (!fixed.includes('\n')) {
        fixed = fixed.replace(/;\s*/g, '\n');
      }
      break;

    case "swift":
      if (!fixed.includes("import Foundation") && !fixed.includes("import Swift")) {
        fixed = "import Foundation\n" + fixed;
      }
      break;

    case "kotlin":
      fixed = fixed.replace(/public class \w+/g, "");
      if (!fixed.includes("fun main")) {
        fixed = fixed + "\nfun main() { println(\"Done\") }";
      }
      break;

    case "bash":
      if (!fixed.startsWith("#!/")) {
        fixed = "#!/bin/bash\n" + fixed;
      }
      break;

    default:
      break;
  }

  return fixed;
};

export const runCode = async (code, language, stdin = "") => {
  // ✅ Non-executable languages
  const nonExecutable = ["html", "css", "sql", "json", "yaml", "markdown"];
  if (nonExecutable.includes(language)) {
    return {
      output: "",
      error: `${language.toUpperCase()} code execute nahi ho sakta!`,
      status: "Not Supported",
      time: null,
      memory: null,
    };
  }

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      output: "",
      error: `${language} language supported nahi hai!`,
      status: "Not Supported",
      time: null,
      memory: null,
    };
  }

  const finalCode = fixCode(code, language);

  try {
    // ✅ wait=true — directly result milega
    const submitRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: finalCode,
          language_id: languageId,
          stdin: stdin || "",  // ✅ stdin properly pass
        }),
      }
    );

    const result = await submitRes.json();

    // ✅ Agar wait=true se result nahi mila toh polling karo
    if (result.token && !result.stdout && !result.stderr && result.status?.id <= 2) {
      let attempts = 0;
      while (attempts < 10) {
        await delay(1000);
        const pollRes = await fetch(
          `${JUDGE0_URL}/submissions/${result.token}?base64_encoded=false`
        );
        const pollResult = await pollRes.json();

        if (pollResult.status?.id > 2) {
          return {
            output: pollResult.stdout || "",
            error: pollResult.stderr || pollResult.compile_output || "",
            status: pollResult.status?.description || "Unknown",
            time: pollResult.time,
            memory: pollResult.memory,
          };
        }
        attempts++;
      }
      throw new Error("Execution timeout");
    }

    return {
      output: result.stdout || "",
      error: result.stderr || result.compile_output || "",
      status: result.status?.description || "Unknown",
      time: result.time,
      memory: result.memory,
    };

  } catch (err) {
    return {
      output: "",
      error: err.message,
      status: "Error",
      time: null,
      memory: null,
    };
  }
};