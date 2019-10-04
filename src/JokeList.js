import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import uuid from 'uuid/v4';
import './JokeList.css';

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = { 
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      // takes the jokes stored in strings and turns them into a js object, so use jokes already in storage
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  };

  componentDidMount() {
    if(this.state.jokes.length === 0) this.getJokes();
  };

  async getJokes() {
    try {
    // Load Jokes
    let jokes = [];
    while(jokes.length < this.props.numJokesToGet){
      let res = await axios.get("https://icanhazdadjoke.com/",
      {headers: {Accept: "application/json"}} // looking for json version not HTML version
      );
      let newJoke = res.data.joke;
      if(!this.seenJokes.has(newJoke)) {
        jokes.push({ id: uuid(), text: res.data.joke, votes: 0 }); // represents a single joke
      } else {
        console.log("Found a duplicate!");
        console.log(newJoke);
      }
    }
    this.setState(st => ({ 
      loading: false,
      jokes: [...st.jokes, ...jokes] // existing jokes and new jokes respectively
      }),
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    ); // each joke pushed was simply a string
    // window.localStorage.setItem("jokes", JSON.stringify(jokes)); 
    /* above sets all the jokes to strings in localStorage using JSON,
    can parse JSON to get it back */
    } catch(e) {
        alert(e);
        this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      st => ({ // call old state using callback
        jokes: st.jokes.map(j =>  // map over existing jokes in the state then check if id matches one we're looking for
          j.id === id ? {...j, votes: j.votes + delta} : j // new obj containing old joke info but update the votes
        )
      }),
    () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    ); // called after set state finishes
  };

  handleClick() {
    this.setState({loading: true}, this.getJokes); // use this.getJokes as a callback
  }

  render() {
    if(this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading</h1>
        </div>
      );
    }
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1> 
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt=""/>
          <button className="JokeList-getmore" onClick={this.handleClick}>Fetch Jokes</button>
        </div>

        <div className="JokeList-jokes">
            {jokes.map(j => (
              <Joke 
                key={j.id} 
                votes={j.votes} 
                text={j.text} 
                upvote={() => this.handleVote(j.id, 1)} 
                downvote={() => this.handleVote(j.id, -1)} 
              />
            ))}
        </div>
      </div>
    );
  }
}

export default JokeList;
