export const promptParser = (botPrompt) => {
   // Поддержка обоих форматов промптов
   const name = botPrompt.name || botPrompt.public_name;

   const promptParser = {
      role: 'assistant',
      content: `
         Character Overview:
         ${name ? `- Name: ${name}` : ''}
         ${
            botPrompt.description?.agent
               ? `- Agent Description: ${botPrompt.description.agent}`
               : ''
         }
         ${
            botPrompt.description?.mission
               ? `- Mission: ${botPrompt.description.mission}`
               : ''
         }
         ${
            botPrompt.description?.identity
               ? `- Identity: ${botPrompt.description.identity}`
               : ''
         }
         ${
            botPrompt.description?.you_are
               ? `- You Are: ${botPrompt.description.you_are}`
               : ''
         }
         ${
            botPrompt.description?.your_existence
               ? `- Your Existence: ${botPrompt.description.your_existence}`
               : ''
         }
         ${
            botPrompt.description?.what_you_know
               ? `- What You Know: ${botPrompt.description.what_you_know}`
               : ''
         }
   
         Personality:
         ${
            botPrompt.personality?.traits
               ? Array.isArray(botPrompt.personality.traits)
                  ? `- Traits:\n${botPrompt.personality.traits
                       .map((trait) => `  - ${trait}`)
                       .join('\n')}`
                  : `- Traits: ${botPrompt.personality.traits}`
               : ''
         }
         
         ${
            botPrompt.personality?.tone
               ? `- Tone:\n${botPrompt.personality.tone
                    .map((tone) => `  - ${tone}`)
                    .join('\n')}`
               : ''
         }
         ${
            botPrompt.personality?.values
               ? `- Values: ${botPrompt.personality.values}`
               : ''
         }
         ${
            botPrompt.personality?.cultural_association
               ? `- Cultural Association: ${botPrompt.personality.cultural_association}`
               : ''
         }
         ${
            botPrompt.personality?.reaction_to_hostility
               ? `- Reaction to Hostility: ${botPrompt.personality.reaction_to_hostility}`
               : ''
         }
   
         Instructions:
         ${
            botPrompt.instructions?.do
               ? `Do:\n${botPrompt.instructions.do
                    .map((inst) => `- ${inst}`)
                    .join('\n')}`
               : ''
         }
         ${
            botPrompt.instructions?.dont
               ? `\nDon't:\n${botPrompt.instructions.dont
                    .map((inst) => `- ${inst}`)
                    .join('\n')}`
               : ''
         }
         ${
            Array.isArray(botPrompt.instructions)
               ? botPrompt.instructions
                    .map((instruction) => `- ${instruction}`)
                    .join('\n')
               : ''
         }
         ${
            botPrompt.instructions?.response_strategy
               ? `\nResponse Strategy:\n${botPrompt.instructions.response_strategy}`
               : ''
         }
         ${
            botPrompt.instructions?.admins_and_tagging
               ? `\nAdmins and Tagging:\n${botPrompt.instructions.admins_and_tagging}`
               : ''
         }
         
         ${
            botPrompt.example_interaction
               ? `
         Example Interaction:
         User: ${botPrompt.example_interaction[0].user}
         Assistant: ${botPrompt.example_interaction[0].caspy}`
               : ''
         }
       `
         .trim()
         .replace(/^\s+$/gm, '')
         .replace(/\n{3,}/g, '\n\n')
   };

   return promptParser;
};
