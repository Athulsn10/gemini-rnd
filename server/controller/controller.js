const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getSearchResult = async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const file = req.files.image; 
      const base64Image = file.data.toString('base64');
      const prompt = ` 
       What are all the contents in this image, reply only the contents as a array, don't add anything additional
       Respond in this JSON format:
            {
                "contents": ["item1","item2"],
            }

        If the image contain a photo of a person, try to identify the person, respond in the same format
       `; 
     
      
      const result = await model.generateContent({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: {
              mimeType: file.mimetype,
              data: base64Image
            }}
          ]
        }]
      });
      
      const responseText = result.response.text();
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
      res.status(500).json({ error: "Failed to generate content.", details: error.message }); 
    }
  };

const uploadImage = async(req, res) => {
 console.log('upload image!!')
};

module.exports = { getSearchResult, uploadImage};