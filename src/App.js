import React from 'react';
import { CommandBar, MessageBar, MessageBarType, Pivot, PivotItem, TextField } from '@fluentui/react';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this._developCommandItems = [
      {
        key: 'load',
        text: 'Load...',
        iconProps: { iconName: 'Upload' },
        onClick: () => this._promptGrammarFile()
      },
      {
        key: 'validate',
        text: 'Validate',
        onClick: () => this._validateGrammar()
      }
    ];    

    this.state = {
      grammar: {
        error: null,
        text: ''
      }
    };
  }

  render() {
    return (
      <div className="app">
        <div className="navigation-bar">
          <div className="navigation-bar-title">
            Lark Designer
          </div>

          <div className="navigation-bar-menu">
            { `Version ${this.props.version}` }
          </div>
        </div>

        <div className="app-content">
          <Pivot>
            <PivotItem
              headerText="Develop"
              itemIcon="CodeEdit"
            >
              <input
                id="grammar-file-input"
                type="file"
                accept=".lark"
                onChange={(e) => this._loadGrammar(e)}
              />
              <CommandBar items={this._developCommandItems} />

              {this.state.grammar.error 
                ? <MessageBar
                  messageBarType={MessageBarType.error}
                  dismissButtonAriaLabel="Close"
                >
                  {this.state.grammar.error.message}
                </MessageBar>
                : ''
              }

              <TextField multiline value={this.state.grammar.text} />
            </PivotItem>

            <PivotItem
              headerText="Test"
              itemIcon="TestBeaker"
            >
              <div id="test-tab" className="tab-content">

              </div>
            </PivotItem>
          </Pivot>
        </div>
      </div>
    );
  }

  _loadGrammar(evt) {
    const file = evt.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState({
        ...this.state,
        grammar: {
          ...this.state.grammar,
          text: e.target.result
        }
      })
    };
    reader.readAsText(file, "UTF-8");
  }

  _promptGrammarFile() {
    const fileInput = document.getElementById("grammar-file-input");
    fileInput.click();
  }

  async _validateGrammar() {
    try {
      this.state.grammar.isValidating = true;

      const res = await fetch("api/validate", {
        body: JSON.stringify({
          grammar: this.state.grammar.text,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const isSuccess = res.status >= 200 && res.status <= 299;

      //this.state.grammar.isValid = isSuccess;
      if (!this.state.grammar.isValid) {
        const resBody = await res.json();

        this.setState({
          ...this.state,
          grammar: {
            ...this.state.grammar,
            error: {
              message: resBody.error.message.replaceAll("\n", "<br />"),
            }
          }
        });
      } else {
        this.setState({
          ...this.state,
          grammar: {
            ...this.state.grammar,
            error: null
          }
        });
        //this.state.grammar.error = null;
      }
    } finally {
      //this.state.grammar.isValidating = false;
    }
  }
}


export default App;
