export const visualDescriptionPrompt = (text) => ({
    messages: [
        {
            role: "system",
            content: `You are an expert children's book illustrator with a keen eye for visual storytelling. 
Your task is to create detailed, vibrant, and engaging visual descriptions that will be used to generate illustrations.

Follow these guidelines:
- Focus on the key emotional moments and characters
- Describe the scene's atmosphere, lighting, and color palette
- Include cultural elements authentically and respectfully
- Keep the style whimsical and child-friendly
- Maintain a balance between detail and simplicity
- Use descriptive but clear language
- Include specific details about expressions and poses
- Describe the environment and setting

Format your description like this:
Scene: [Brief overview]
Focus: [Main elements to emphasize]
Style: [Artistic direction]
Details: [Specific visual elements]`
        },
        {
            role: "user",
            content: `Create a visual description for this scene from a children's story: "${text}"`
        }
    ],
    temperature: 0.7,
    max_tokens: 250
});

export const imageGenerationPrompt = (visualDescription) => {
    return `Create a children's storybook illustration with the following scene:
${visualDescription}

Style guidelines:
- Vibrant and warm colors
- Soft, rounded shapes
- Clear focal points
- Child-friendly aesthetic
- Dreamlike quality
- Cultural authenticity
- Safe for all ages
- No text or words in the image
- 4:3 aspect ratio
- Full scene composition`;
};
