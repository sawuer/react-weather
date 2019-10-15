import React, { Component } from 'react';
import './CitySelector.css';
import CityForecast from '../CityForecast/CityForecast';
import ErrorBadge from '../ErrorBadge/ErrorBadge';

const API_KEY = 'ff4781d8-005f-4319-9140-9fac60c1f425';

class CitySelector extends Component {
  state = {
    searchField: '',
    cities: [],
    // selectedCity: {
    //   country: "Казахстан",
    //   lat: "43.238293",
    //   lon: "76.945465",
    //   name: "Алматы",
    // },
    selectedCity: null,
    error: false,
    searchFault: false,
  }

  getCities () { // from Yandex Geocoder API
    fetch('https://geocode-maps.yandex.ru/1.x/?apikey=' 
      + API_KEY + '&format=json&geocode='
      + this.state.searchField + '&results=100'
    )
    .then(resp => resp.json())
    .then(({ response: { GeoObjectCollection: { featureMember } } }) => {
      /**
       * Yandex Geocoder API не позволяет искать только городам
       * поэтому здесь нужна фильтрация (locality - нас. пункт)
       */
      const cities = featureMember.filter(({ GeoObject: { metaDataProperty } }) => {
        return metaDataProperty.GeocoderMetaData.kind === 'locality' ||
          metaDataProperty.GeocoderMetaData.kind === 'province';
      });
      if (cities.length === 0) {
        return this.setState({ searchFault: true });
      }
      this.setState({ 
        cities: cities.map(({ 
          GeoObject: { Point, metaDataProperty: { GeocoderMetaData }, description, name } }) => {
          return {
            lon: Point.pos.split(' ')[0],
            lat: Point.pos.split(' ')[1],
            name,
            country: description
          };
        }),
      });
    })
    .catch(_ => {
      this.setState({ error: true });
    });
  }

  selectCity (selectedCity) { 
    this.setState({ 
      selectedCity,
      cities: [],
    });
  }

  closeCity () {
    this.setState({
      selectedCity: null,
    });
  }

  searchInput (str) {
    clearTimeout(window.counter);
    this.setState({ 
      cities: [],
      searchField: str,
      selectedCity: null,
      error: false,
      searchFault: false,
    });
    if (str === '') {
      return this.setState({ cities: [] })
    }
    window.counter = setTimeout(() => this.getCities(), 500);
  }

  render() {
    return (
      <div className="CitySelector">
        <div>
          <div className="CitySelector-search">
            
            {this.state.selectedCity == null ?
              <div>
                <div className="CitySelector-inputWrap">
                  <input
                    placeholder="Выберите населенный пункт..."
                    className="CitySelector-input"
                    id="standard-uncontrolled"
                    label="Выбрать город..."
                    onChange={e => this.searchInput(e.target.value)}
                  />
                </div>
                {this.state.error ? <ErrorBadge msg={'Не получается получить список городов'} /> : '' }
                <div className="CitySelector-list">
                  {this.state.searchFault ? 
                    <div>Ничего не найдено. Попробуйте еще раз</div>
                  : ''}
                  {this.state.cities.map((city, idx) => {
                    return (
                      <div 
                        className="CitySelector-listItem"
                        key={idx} 
                        onClick={() => this.selectCity(city)}
                      >
                        <div>{city.name}, {city.country}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            : 
              <CityForecast onClose={this.closeCity.bind(this)} city={this.state.selectedCity} />
            }

          </div>
        </div>
      </div>
    );
  }
}

export default CitySelector;
