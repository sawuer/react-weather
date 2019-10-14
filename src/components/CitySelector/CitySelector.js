import React, { Component } from 'react';
import './CitySelector.css';
import CityForecast from '../CityForecast/CityForecast';

const API_KEY = 'ff4781d8-005f-4319-9140-9fac60c1f425';

class CitySelector extends Component {
  state = {
    searchField: '',
    cities: [],
    selectedCity: {
      country: "Казахстан",
      lat: "43.238293",
      lon: "76.945465",
      name: "Алматы",
    },
    selectedCity: null,
  }

  getCities () { // from Yandex Geocoder API
    fetch('https://geocode-maps.yandex.ru/1.x/?apikey=' 
      + API_KEY + '&format=json&geocode='
      + this.state.searchField + '&results=50'
    )
    .then(resp => resp.json())
    .then(({ response: { GeoObjectCollection: { featureMember } } }) => {
      this.setState({ 
        cities: featureMember
          /**
           * Yandex Geocoder API не позволяет искать только городам
           * поэтому здесь нужна фильтрация (locality - нас. пункт)
           */
          .filter(({ GeoObject: { metaDataProperty } }) => {
            return metaDataProperty.GeocoderMetaData.kind === 'locality'
          })
          .map(({ 
            GeoObject: { Point, metaDataProperty: { GeocoderMetaData }, name } }) => {
            return {
              lon: Point.pos.split(' ')[0],
              lat: Point.pos.split(' ')[1],
              name,
              country: GeocoderMetaData.AddressDetails.Country.CountryName
            };
          }),
        });
      console.log(this.state.cities);
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
      searchField: str,
      selectedCity: null,
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
                <div className="CitySelector-list">
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
