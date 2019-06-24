import React, {Component} from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth'
import {Redirect} from 'react-router-dom'

export default class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      logged:false,
    }    

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(){
    const esto = this;
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(
      (result) => {

        let user = result.user;

        esto.props.loginUsuario(user);

        esto.setState({
          logged:true,
        });

      }

    );
  }

  render(){
    if (this.state.logged) {
      return (
        <Redirect to={'/'}/>
      );
    }else{
      return(
        <button onClick={()=>{this.handleClick();}}>Iniciar sesión con Google</button>
      );
    }
  }
}