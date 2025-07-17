import React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useTheme } from '../../contexts/ThemeContext';

const BlockNoteEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const { isDark } = useTheme();

  const editor = useCreateBlockNote({
    initialContent: value || [
      {
        id: "1",
        type: "paragraph",
        content: "Start writing your document here..."
      }
    ],
    animations: true,
    defaultStyles: true,
    trailingBlock: true,
    heading: {
      levels: [1, 2, 3]
    }
  }, []);

  const handleChange = () => {
    if (onChange) {
      const content = editor.document;
      onChange(content);
    }
  };

  return (
    <div className="w-full min-h-[500px] bg-white dark:bg-secondary-800 rounded-lg">
      <BlockNoteView 
        editor={editor}
        theme={isDark ? "dark" : "light"}
        onChange={handleChange}
        formattingToolbar={true}
        linkToolbar={true}
        sideMenu={true}
        slashMenu={true}
        emojiPicker={true}
        filePanel={true}
        tableHandles={true}
        className="min-h-[500px]"
      />
    </div>
  );
};

export default BlockNoteEditor;