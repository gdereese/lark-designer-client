import React, { useState } from 'react';
import { CommandBar, FontIcon, getTheme, MessageBar, MessageBarType, Pivot, PivotItem, Spinner, Text, TextField } from '@fluentui/react';

import './App.css';


function App(props) {
  const [grammar, setGrammar] = useState({});

  const theme = getTheme();
  const styles = {
    navigationBar: {
      backgroundColor: theme.palette.themePrimary
    },
    navigationBarText: {
      color: theme.palette.white
    },
  };

  const loadGrammar = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setGrammar(prev => {
        return {
          ...prev,
          text: e.target.result
        };
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  const promptGrammarFile = () => {
    const fileInput = document.getElementById("grammar-file-input");
    fileInput.click();
  }

  const renderGrammarError = (error) => {
    if (!error) {
      return '';
    }
    
    return (
      <MessageBar
        messageBarType={MessageBarType.error}
        dismissButtonAriaLabel="Close"
      >
        {error.message}
      </MessageBar>
    );
  };

  const renderValidationStatus = (grammar) => {
    if (grammar.isValidating === undefined) {
      return '';
    }

    if (grammar.isValidating) {
      return (
        <Spinner label="Validating..." labelPosition="right" /> 
      );
    } else if (grammar.isValid) {
      return (
        <Text nowrap>
          <FontIcon iconName="CheckMark" /> Valid
        </Text>
      );
    } else {
      return (
        <Text nowrap>
          <FontIcon iconName="StatusCircleErrorX" /> Invalid
        </Text>
      );
    }
  };

  const validateGrammar = async (text) => {
    try {
      setGrammar(prev => {
        return { 
          ...prev,
          isValidating: true 
        };
      });

      const res = await fetch("api/validate", {
        body: JSON.stringify({
          grammar: text,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const isSuccess = res.status >= 200 && res.status <= 299;

      if (!isSuccess) {
        const resBody = await res.json();

        setGrammar(prev => {
          return {
            ...prev,
            error: {
              message: resBody.error.message.replaceAll("\n", "<br />"),
            },
            isValid: false
          };
        });
      } else {
        setGrammar(prev => {
          return {
            ...prev,
            error: null,
            isValid: true
          };
        });
      }
    } finally {
      setGrammar(prev => {
        return {
          ...prev,
          isValidating: false,
        };
      });
    }
  };

  const _developCommandItems = [
    {
      key: 'load',
      text: 'Load...',
      iconProps: { iconName: 'Upload' },
      onClick: () => promptGrammarFile()
    },
    {
      key: 'validate',
      text: 'Validate',
      iconProps: { iconName: 'CheckMark' },
      onClick: () => validateGrammar(grammar.text),
    }
  ];  

  return (
    <div>
      <div className="navigation-bar" style={styles.navigationBar}>
        <Text variant="large" style={styles.navigationBarText}>
          Lark Designer
        </Text>

        <Text style={styles.navigationBarText}>
          { `Version ${props.version}` }
        </Text>
      </div>

      <Pivot>
        <PivotItem
          headerText="Develop"
          itemIcon="CodeEdit"
        >
          <input
            id="grammar-file-input"
            type="file"
            accept=".lark"
            onChange={(e) => loadGrammar(e.target.files[0])}
          />
          <CommandBar items={_developCommandItems} />

          {renderGrammarError(grammar.error)}

          <TextField 
            multiline 
            className="code-input"
            value={grammar.text} 
            onChange={(e) => setGrammar({ text: e.target.value })}
          />

          {renderValidationStatus(grammar)}
        </PivotItem>

        <PivotItem
          headerText="Test"
          itemIcon="TestBeaker"
        >
        </PivotItem>
      </Pivot>
    </div>
  );
}

export default App;
