import React from 'react';
import logo from './logo.svg';
import './App.css';
import { LineChart } from '@opd/g2plot-react'
import { LineConfig } from '@antv/g2plot'
import axios from 'axios';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      demand:"Simulation is not running.",
      running:false,
      search_param: "iphone",
      time: 0,
      timer: 0,
      fetchUser: [],
      sentiment_data: [
        { time: '0', value: 0 },
      ],
      favorite_data: [
        { time: '0', value: 0 },
      ],
      retweet_data: [
        { time: '0', value: 0 },
      ],
    };
    //this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
  }

  fetchUser(search_param) {
    var str = [];
    axios.get('https://realtime-servers.herokuapp.com/orders?search_param=' + search_param)
      .then((response) => {
        this.setState({ fetchUser: response.data })
      })
      .catch((error) => {
        console.log(error);
      });
    return str
  }

  populateData() {
    var data = [
      { time: 'seconds', sentiment_score: '3' }
    ]
  }

  x(input_data) {
    const config: LineConfig = {
      height: 300,
      title: {
        visible: true,
        text: 'x - time',
      },
      description: {
        visible: true,
        text: 'y - score',
      },
      padding: 'auto',
      forceFit: true,
      xField: 'time',
      yField: 'value',
      label: {
        visible: true,
        type: 'point',
      },
      point: {
        visible: true,
        size: 5,
      },
      xAxis: {
        tickCount: 10,
      },
      data: input_data,
    }
    return <LineChart {...config} />
  }

  fillGraph(sentimentDataType, favoriteDataType, retweetDataType) {
    this.fetchUser(this.state.search_param);
    var new_sentiment_data = this.state.sentiment_data;
    var new_favorite_data = this.state.favorite_data;
    var new_retweet_data = this.state.retweet_data;
    new_sentiment_data.push({ time: this.state.time, value: sentimentDataType })
    new_favorite_data.push({ time: this.state.time, value: favoriteDataType })
    new_retweet_data.push({ time: this.state.time, value: retweetDataType })
    this.setState({
      sentiment_data: new_sentiment_data,
      favorite_data: new_favorite_data,
      retweet_data: new_retweet_data,
      time: this.state.time + 1
    })
  }

  intervalID = 0;
  secondIntervalId = 1

  clearTrigger() {
    this.setState({running:false});
    clearInterval(this.intervalID);
    clearInterval(this.secondIntervalId);
    this.setState({ timer: 0 })
  }

  trigger() {
    this.setState({running:true});
    if (this.state.search_param != "") {
      this.timer();
      this.intervalID = setInterval(() => {
        this.showDemand();
        this.fillGraph(this.state.fetchUser[0], this.state.fetchUser[1], this.state.fetchUser[2])
        console.log(this.state.fetchUser)
      }, 5000);
    }
    else {
      alert("The serach parameter cannot be empty.")
    }
  }

  updateTimer() {
    this.setState({ timer: (this.state.timer + 1) % 5 })
  }

  timer() {
    this.secondIntervalId = setInterval(() => {
      this.updateTimer()
    }, 1000);
  }

showDemand(){
  var sentiment_score = this.state.sentiment_data[(this.state.sentiment_data.length)-1].value;
  if (this.state.running){
    if (sentiment_score < 0){
      this.setState({demand:"Demand will decrease in the next quarter."});
    }
    else if (sentiment_score > 0 && sentiment_score <= 5){
      this.setState({demand:"Demand will remain constant in the next quarter."});
    }
    else{
      this.setState({demand:"Demand will increase in the next quarter."});
    }
}
  else{
    this.setState({demand:"Simulation is not running."})
  }
}

  render() {
    return (
      <div className="App">
        <div className="progressBar">
          <CircularProgressbar value={(this.state.timer / 5) * 100} text={`${(this.state.timer)}`} />
        </div>
        <div>The data updates every 5 seconds..</div>
        <div>Predicting demand for - <a className="searchParam"> {this.state.search_param} </a> - based on the most recently posted 100 tweets.</div>
        <div className="simulationStartStop">
          <textarea rows="1" className="searchBar" onChange={(e) => { this.setState({ search_param: e.target.value }) }}>
            {this.state.search_param}
          </textarea>
          <button className="button" onClick={() => { this.trigger() }}>Run Simulation</button>
          <button className="button" onClick={() => { this.clearTrigger() }}>Stop Simulation</button>
        </div>
        <div className="demandIndicator"> {this.state.demand} </div>
        <div className="graphs">
          <div className="graphOuterContainer">
            <div className="graphContainer">
              {this.x(this.state.sentiment_data)}
            </div>
            <div>Sentiment</div>
          </div>
          {/*this.x(this.state.favorite_data)*/}
          <div className="graphOuterContainer">
            <div className="graphContainer">
              {this.x(this.state.retweet_data)}
            </div>
            <div>Retweets and Favorites</div>
          </div>
        </div>
        <div className="disclaimer">
          This tool is created by Aakarsh Sinha for - A Machine Learning Model For Predicting Real-time Demand
          Using Social Media And Other Publicly Available Sources
          </div>
      </div>
    );
  }
}


export default MouseTracker;
