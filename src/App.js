import { CommandBar } from '@fluentui/react';
import { FontIcon } from '@fluentui/react';
import { getTheme } from '@fluentui/react';
import { Link } from '@fluentui/react';
import { Pivot } from '@fluentui/react';
import { PivotItem } from '@fluentui/react';
import React from 'react';
import { Stack } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { TextField } from '@fluentui/react';
import { useState } from 'react';

import './App.css';


function App(props) {
  const [state, setState] = useState({
    grammar: {
      isRefVisible: false
    },
    input: {},
    output: {}
  });

  const theme = getTheme();

  const css = {
    appContent: {
      padding: theme.spacing.m
    }
  };

  const styles = {
    appPivot: {
      root: {
        paddingBottom: theme.spacing.m
      }
    },
    columnStackItem: {
      root: {
        flexBasis: 0
      }
    },
    navigationBarStack: {
      root: {
        backgroundColor: theme.palette.themePrimary,
        padding: '1rem',
        selectors: {
          'span': {
            color: theme.palette.white
          }
        }
      }
    },
    tabContentStack: {
      root: {
        height: '50vh'
      }
    },
    textField: {
      root: {
        height: '100%'
      },
      field: {
        fontFamily: 'Monaco, Menlo, Consolas, "Droid Sans Mono", Inconsolata, "Courier New", monospace',
      },
      fieldGroup: {
        height: 'inherit'
      },
      wrapper: {
        height: 'inherit'
      }
    }
  };

  const loadGrammar = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setState(prev => {
        return {
          ...prev,
          grammar: {
            ...prev.grammar,
            text: e.target.result
          }
        };
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  const promptGrammarFile = () => {
    const fileInput = document.getElementById("grammar-file-input");
    fileInput.click();
  };

  const setGrammarText = (value) => {
    setState(prev => { 
      return { 
        ...prev, 
        grammar: { 
          ...prev.grammar, 
          text: value 
        }
      };
    });
  };

  const setInputText = (value) => {
    setState(prev => { 
      return { 
        ...prev, 
        input: { 
          ...prev.input, 
          text: value 
        }
      };
    });
  };

  const toggleGrammarRefVisibility = () => {
    setState(prev => { 
      return { 
        ...prev, 
        grammar: { 
          ...prev.grammar, 
          isRefVisible: !prev.grammar.isRefVisible 
        }
      };
    });
  };

  const validateGrammar = async (text) => {
    if (!text) {
      return null;
    }

    const res = await fetch('api/validate', {
      body: JSON.stringify({
        grammar: text,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const isSuccess = res.status >= 200 && res.status <= 299;

    if (!isSuccess) {
      const resBody = await res.json();

      return resBody.error.message;
    } else {
      return null;
    }
  };

  const validateInput = async (text) => {
    if (!state.grammar.text) {
      return null;
    }

    const res = await fetch('/api/parse', {
      body: JSON.stringify({
        grammar: state.grammar.text,
        input: text || '',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const isSuccess = res.status >= 200 && res.status <= 299;

    var resBody;
    try {
      resBody = await res.json();
    } catch {
      resBody = null;
    }
    const errorType = ((resBody || {}).error || {}).type;

    setState(prev => {
      return {
        ...prev,
        output: {
          ...prev.output,
          ast: (resBody || {}).result
        }
      };
    });

    if (!isSuccess) {
      if (errorType === 'grammar') {
        return 'Input could not be parsed due to a grammar error; check the Grammar tab for details.';
      } else if (errorType === 'parse') {
        return resBody.error.message;
      } else if (errorType) {
        return `Unrecognized error type ${errorType}: ${resBody.error.message}`;
      } else {
        return 'The server encountered an unexpected error.';
      }
    } else {
      return null;
    }
  };

  const _developCommandItems = [
    {
      key: 'import',
      text: 'Import',
      iconProps: { iconName: 'Upload' },
      onClick: () => promptGrammarFile()
    },
  ];  

  const _developCommandFarItems = [
    {
      key: 'toggle_reference',
      text: 'Grammar reference',
      iconProps: { 
        iconName: state.grammar.isRefVisible ? 'ClosePane' : 'OpenPane' 
      },
      onClick: () => toggleGrammarRefVisibility()
    }
  ];

  const _navigationBarTokens = {
    padding: '1rem'
  };
  
  const _tabContentStackTokens = {
    childrenGap: theme.spacing.m
  };

  return (
    <div>
      <Stack 
        horizontal 
        horizontalAlign="space-between" 
        styles={styles.navigationBarStack}
        tokens={_navigationBarTokens}
        verticalAlign="center"
      >
        <Stack.Item>
          <Text variant="large">
            Lark Designer
          </Text>
        </Stack.Item>

        <Stack.Item>
          <Text>
            { `Version ${props.version}` }
          </Text>
        </Stack.Item>
      </Stack>

      <div style={css.appContent}>
        <Pivot styles={styles.appPivot}>
          <PivotItem headerText="Grammar">
            <CommandBar 
              items={_developCommandItems} 
              farItems={_developCommandFarItems} 
            />

            <Stack 
              horizontal 
              horizontalAlign="space-between"
              styles={styles.tabContentStack}
              tokens={_tabContentStackTokens}
            >
              <Stack.Item 
                disableShrink="true" 
                grow="1.5"
                styles={styles.columnStackItem}
              >
                <input
                  id="grammar-file-input"
                  type="file"
                  accept=".lark"
                  onChange={(e) => loadGrammar(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                <TextField 
                  multiline 
                  onChange={(e) => setGrammarText(e.target.value)}
                  onGetErrorMessage={(v) => validateGrammar(v)}
                  styles={styles.textField}
                  value={state.grammar.text} 
                />
              </Stack.Item>

              { state.grammar.isRefVisible ? 
                <Stack.Item 
                  disableShrink="true" 
                  grow="1"
                  styles={styles.columnStackItem}
                >
                  <h2>Grammar reference</h2>

                  <Link href="https://lark-parser.readthedocs.io/en/latest/grammar.html" target="_blank">
                    <span className="icon-text-left">Documentation</span>
                    <FontIcon iconName="NavigateExternalInline" />
                  </Link>

                  <h3>Definitions</h3>
                  <table className="definition-table">
                    <tbody>
                      <tr>
                        <th>Rule (non-terminal)</th>
                        <td>
                          <code>&lt;name&gt;: &lt;non-term-exp&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Terminal</th>
                        <td>
                          <code>&lt;NAME&gt;: &lt;term-exp&gt;</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Terminal expressions</h3>
                  <table className="definition-table">
                    <tbody>
                      <tr>
                        <th>String literal</th>
                        <td>
                          <code>"string"</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Case-insensitive string literal</th>
                        <td>
                          <code>"string"i</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Regular expression</th>
                        <td>
                          <code>/regular expression/</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Non-terminal expressions</h3>
                  <table className="definition-table">
                    <tbody>
                      <tr>
                        <th>Rule reference</th>
                        <td>
                          <code>&lt;name&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Terminal reference</th>
                        <td>
                          <code>&lt;NAME&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Sequence group</th>
                        <td>
                          <code>(&lt;exp&gt; ...)</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Optional</th>
                        <td>
                          <code>[&lt;exp&gt; ...]</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Quantifiers</h3>
                  <table className="definition-table">
                    <tbody>
                      <tr>
                        <th>0 or 1</th>
                        <td>
                          <code>&lt;name | NAME&gt;?</code>
                        </td>
                      </tr>
                      <tr>
                        <th>0 or more</th>
                        <td>
                          <code>&lt;name | NAME&gt;*</code>
                        </td>
                      </tr>
                      <tr>
                        <th>1 or more</th>
                        <td>
                          <code>&lt;name | NAME&gt;+</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Exactly n</th>
                        <td>
                          <code>&lt;name | NAME&gt; ~ n</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Between n to m</th>
                        <td>
                          <code>&lt;name | NAME&gt; ~ n..m</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Directives</h3>
                  <table className="definition-table">
                    <tbody>
                      <tr>
                        <th>Ignore a terminal when parsing</th>
                        <td>
                          <code>%ignore &lt;NAME&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Import a definition from another grammar</th>
                        <td>
                          <code>%import &lt;module&gt;.&lt;name&gt;</code><br />
                          <code>%import &lt;module&gt;.&lt;NAME&gt;</code><br />
                          <code>%import &lt;module&gt;.&lt;name&gt; -> &lt;name&gt;</code><br />
                          <code>%import &lt;module&gt;.&lt;NAME&gt; -> &lt;NAME&gt;</code><br />
                          <code>%import &lt;module&gt; (&lt;name | NAME&gt;, ...)</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Declare a terminal without defining it</th>
                        <td>
                          <code>%declare &lt;NAME&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Override a definition</th>
                        <td>
                          <code>%override &lt;name&gt;: &lt;non-term-exp&gt;</code><br />
                          <code>%override &lt;NAME&gt;: &lt;term-exp&gt;</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Extend a definition</th>
                        <td>
                          <code>%extend &lt;name&gt;: &lt;non-term-exp&gt;</code><br />
                          <code>%extend &lt;NAME&gt;: &lt;term-exp&gt;</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Stack.Item>
                : null 
              }
            </Stack>
          </PivotItem>

          <PivotItem headerText="Test">
            <Stack 
              horizontal 
              horizontalAlign="space-between"
              styles={styles.tabContentStack}
              tokens={_tabContentStackTokens}
            >
              <Stack.Item 
                disableShrink="true" 
                grow="1.5"
                styles={styles.columnStackItem}
              >
                <TextField 
                  multiline 
                  onChange={(e) => setInputText(e.target.value)}
                  onGetErrorMessage={(v) => validateInput(v)}
                  styles={styles.textField}
                  value={state.input.text} 
                />
              </Stack.Item>

              <Stack.Item 
                disableShrink="true" 
                grow="1"
                styles={styles.columnStackItem}
              >
                
              </Stack.Item>
            </Stack>
          </PivotItem>
        </Pivot>
      </div>
    </div>
  );
}

export default App;
