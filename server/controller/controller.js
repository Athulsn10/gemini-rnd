const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const xlsx = require("xlsx");

const getSearchResult = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const file = req.files.image;
    let fileContent = "";
    const base64Image = file.data.toString("base64");
    console.log(file.mimetype)
    switch (file.mimetype) {
      case "image/jpeg":
      case "image/png":
      case "video/mp4":
        const prompt = ` 
          What are all the contents in this image / video, reply only the contents as a array, don't add anything additional
          Respond in this JSON format:
                {
                    "contents": ["item1","item2"],
                }

            If the image contain a photo of a person, try to identify the person, respond in the same format  don't add anything additional.
          `;

        const aiResult = await model.generateContent({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.mimetype,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        });

        fileContent = aiResult.response.text();

        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxResult = await mammoth.extractRawText({ buffer: file.data });
        fileContent = docxResult.value;
        break;

      case "application/pdf":
        const pdfResult = await pdf(file.data);
        fileContent = pdfResult.text;
        break;

      case "application/vnd.ms-excel":
        const workbook = xlsx.read(file.data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        fileContent = xlsx.utils
          .sheet_to_json(worksheet, { header: 1 })
          .join("\n");
        break;

      default:
        return res.status(400).json({ error: "Unsupported file format" });
    }

    const summaryPrompt = `
                Summarize the contents of this file.
                Respond in JSON format: { "contents": ["item1","item2"] }
            `;

    const summaryResult = await model.generateContent({
        contents: [{ parts: [{ text: summaryPrompt + fileContent }] }]
    });

    const responseText = summaryResult.response.text();
    const jsonMatch = responseText.match(/```json\n(.*)\n```/s);
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[1]);
      res.json(parsedResponse);
    } else {
      const parsedResponse = JSON.parse(responseText);
      res.json(parsedResponse);
    }
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "Failed to generate content.", details: error.message });
  }
};

const uploadImage = async (req, res) => {
  console.log("upload image!!");
};

module.exports = { getSearchResult, uploadImage };
