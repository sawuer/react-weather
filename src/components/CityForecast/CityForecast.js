import React, { Component } from 'react';
import './CityForecast.css';
import unites_types from '../../utils/units&types';
import ErrorBadge from '../ErrorBadge/ErrorBadge';

const API_KEY = '28d61ce481690736b87603364680739c';
const kelvinToCelsius = k => ((k - 32) * 5 / 9).toFixed() + ' °C';

class CityForecast extends Component {
  state = {
    weather: [],
    selectedDayIdx: 0,
    error: false,
  }

  getForecast () {
    fetch('http://api.openweathermap.org/data/2.5/forecast/daily?' 
      + '&lat=' + this.props.city.lat 
      + '&lon=' + this.props.city.lon
      + '&units=metric'
      + '&cnt=7&appid=' + API_KEY
    )
    .then(resp => resp.json())
    .then(({ list }) => {
      this.setState({
        weather: list.map(({ temp, dt, humidity, weather, pressure }) => {
          return {
            humidity,
            pressure,
            main: unites_types.weatherTypes[weather[0].main.toLowerCase()],
            date: {
              weekDayShort: unites_types.weekDaysShort[String(new Date(dt * 1000)).split(' ')[0].toLowerCase()],
              month: unites_types.months[String(new Date(dt * 1000)).split(' ')[1].toLowerCase()],
              day: String(new Date(dt * 1000)).split(' ')[2],
            },
            temp: {
              day: kelvinToCelsius(temp.day),
              night: kelvinToCelsius(temp.night),
            },
          };
        }),
      });
    })
    .catch(_ => {
      this.setState({ error: true });
    });
  }

  selectDayIdx(selectedDayIdx) {
    this.setState({ selectedDayIdx });
  }

  componentDidMount () {
    this.getForecast()
  }

  render() {
    return (
      <div className="CityForecast">
        {this.state.error ? <ErrorBadge msg={'Не получается получить прогнозы погоды'} /> : 
          <div>
            <div className="CityForecast-locality">{this.props.city.name}, {this.props.city.country}</div>
            <button 
              className="CityForecast-close" 
              onClick={() => this.props.onClose()}
            >К поиску</button>
            {this.state.weather.map((day, idx) => {
              return (
                this.state.selectedDayIdx === idx ? 
                  <div key={idx}>
                    <div className="CityForecast-main">{day.main}</div>
                    <div className="CityForecast-temp CityForecast-temp--day">{day.temp.day}</div>
                    <div className="CityForecast-temp CityForecast-temp--night">{day.temp.night}</div>
                    <div className="CityForecast-meta">
                      <div>Влажность: {day.humidity}</div>
                      <div>Давление: {day.pressure}</div>
                    </div>
                  </div>
                : ''
              )
            })}
            <div className="CityForest-buttons">
              {this.state.weather.map((day, idx) => {
                return (
                  <button 
                    onClick={() => this.selectDayIdx(idx)}
                    key={idx}
                    className={this.state.selectedDayIdx === idx ? 'CityForecast-button--active CityForest-button' : 'CityForest-button'}
                  >{day.date.weekDayShort}<br/> {day.date.day} {day.date.month}</button>
                )
              })}
            </div>
          </div>
        }

      </div>
    );
  }
}

export default CityForecast;
