import { lexer, parser } from 'marked';
import React, { Component } from 'react';
import { Button } from 'reactstrap';

import { loadItem } from './api';
import { fmtUNIXTime } from './utils';


export default class Comment extends Component {
  constructor(props) {
    super(props);
    const { depth } = this.props;
    const deltaColor = 3.5;
    const deltaIndent = 2;
    const start = 6;
    this.background = `hsl(0, 0%, ${start + depth * deltaColor}%)`;
    this.indent = `${depth * deltaIndent}px`;
    this.state = {
      isDisplayed: false,
      kids: [],
      collapsed: true,
      comment: null,
    };
    this.init();
  }

  componentDidMount() {
    // eslint-disable-next-line no-underscore-dangle
    this._mounted = true;
  }

  componentWillUnmount() {
    // eslint-disable-next-line no-underscore-dangle
    this._mounted = false;
  }

  async init() {
    const { depth, setUser, id } = this.props;
    const comment = await loadItem(id);
    // eslint-disable-next-line no-underscore-dangle
    if (this._mounted) {
      this.setState({
        comment,
        isDisplayed: comment && comment.type === 'comment' && comment.text,
        kids: comment
          .kids
          .map((kId) => <Comment setUser={setUser} depth={depth + 1} key={kId} id={kId} />),
      });
    }
  }

  toggle() {
    this.setState(({ collapsed }) => ({ collapsed: !collapsed }));
  }

  render() {
    const {
      comment,
      kids,
      collapsed,
      isDisplayed,
    } = this.state;
    return (
      isDisplayed
        ? (
          <div className="p-2 m-2" style={{ background: this.background }}>
            <p className="font-weight-bold">
              <Button size="sm" className="font-weight-bold" onClick={() => this.props.setUser(comment.by)}>
                {comment.by}
              </Button>
            </p>
            <p className="font-italic">{fmtUNIXTime(comment.time)}</p>
            <p dangerouslySetInnerHTML={{ __html: parser(lexer(comment.text || '')) }} />
            {comment.kids.length > 0 && (
              <div>
                <Button
                  color={!collapsed ? 'warning' : 'info'}
                  size="sm"
                  className="mb-2 d-block mx-auto text-white"
                  style={{ width: '40%', maxWidth: '225px' }}
                  onClick={() => this.toggle()}
                >
                  {
                    collapsed
                      ? <div>{comment.kids.length} replies <p className="rotate-90 p-0 m-0 d-inline-block mt-0 position-relative" style={{ top: '2px', fontSize: '1.1rem' }}>&gt;</p></div>
                      : <div>close <p className="rotate-270 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '1px', fontSize: '1.1rem' }}>&gt;</p></div>
                  }
                </Button>
                <ol style={{ display: collapsed ? 'none' : 'block', paddingLeft: this.indent }}>
                  { collapsed ? [] : kids}
                </ol>
              </div>
            )}
          </div>
        )
        : null
    );
  }
}
