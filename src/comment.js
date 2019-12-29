import React, {Component} from 'react';
import {loadItem} from './api';
import {Button} from 'reactstrap';
import {lexer, parser} from 'marked';
import {fmtUNIXTime} from './utils';

const config = {
  deltaColor: 5,
  deltaIndent: 2,
  start: 100,
};

export class Comment extends Component {
  constructor(props) {
    super(props);
    this.background = `hsl(0, 0%, ${config.start - this.props.depth * config.deltaColor}%)`;
    this.indent = `${this.props.depth * config.deltaIndent}px`;
    this.state = {
      isDisplayed: false,
      kids: [],
      collapsed: true,
      comment: null,
    };
    this.init();
  }

  async init() {
    const comment = await loadItem(this.props.id);
    this.setState({
      comment,
      isDisplayed: comment && comment.type === 'comment' && comment.text,
      kids: comment.kids.map((id, cIdx) => <Comment setUser={this.props.setUser} depth={this.props.depth + 1} key={cIdx} id={id}/>),
    });
  }

  toggle() {
    this.setState(({collapsed}) => ({collapsed: !collapsed}));
  }

  render() {
    return (
      this.state.isDisplayed ?
        (
          <div className="p-2 rounded m-2" style={{background: this.background}}>
            <p className="font-weight-bold">
              <Button size="sm" className="font-weight-bold" style={{paddingLeft: 0, borderLeft: 0}} onClick={() => this.props.setUser(this.state.comment.by)}>
                {this.state.comment.by}
              </Button>
            </p>
            <p className="font-italic">{fmtUNIXTime(this.state.comment.time)}</p>
            <p dangerouslySetInnerHTML={{__html: parser(lexer(this.state.comment.text || ''))}}/>
            {this.state.comment.kids.length > 0 && (
              <div>
                <Button color={!this.state.collapsed ? 'warning' : 'info'}
                        size="sm" className="mb-2"
                        onClick={() => this.toggle()}>
                  {this.state.collapsed
                    ? `show ${this.state.comment.kids.length} replies`
                    : 'hide'}
                </Button>
                <ol style={{display: this.state.collapsed ? 'none' : 'block', paddingLeft: this.indent}}>{this.state.kids}</ol>
              </div>
            )}
          </div>
        )
        : null
    );
  }
}
