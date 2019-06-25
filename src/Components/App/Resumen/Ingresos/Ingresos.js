import React, {Component} from 'react';
import firebase from '../../../../Utils/firebase';
import {FDtoJSON} from '../../../../Utils/FDtoJSON';

const db = firebase.firestore();

export default class Ingresos extends Component {
  constructor(props) {
    super(props);
    
    this.registrarIngreso = this.registrarIngreso.bind(this);
  }  

  registrarIngreso(event){

    event.preventDefault();

    //let ingresos = this.state.ingresosFijos.slice(0,this.state.ingresosFijos.length);
    
    let ingreso = FDtoJSON(new FormData(event.target));

    ingreso.registro = firebase.firestore.Timestamp.now();    

    let presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);
    
    db.runTransaction(
      function (transaction) {
        return transaction.get(presupuesto).then(
          (doc)=>{
            transaction.update(presupuesto,
              {
                dineroDisponible:Number(doc.data().dineroDisponible)+Number(ingreso.importe),
                dineroLibre:Number(doc.data().dineroLibre)+Number(ingreso.importe),
              }
            );
          }
        );
      }
    );    
    
    presupuesto.collection('Ingresos').add(ingreso).then(
      (docRef)=>{

        alert('Ingreso guardado');

        /*ingreso.id = docRef.id;

        ingresos.push(
          ingreso
        );

        esto.setState({
          ingresosFijos:ingresos,
        });*/

      }
    ).catch(
      ()=>alert('No se pudo guardar el ingreso')
    );
    event.target.reset();
  }

  render(){
    return(
      <div>
          <form onSubmit={this.registrarIngreso}>
            <h4>Ingresos fijos en el periodo:</h4>

            <div>
              <label>
                Concepto:
              </label>
              <input type="text" name="concepto" required/>
            </div>

            <div>
              <label>
                Importe:
              </label>
              <input type="text" name="importe" required/>
            </div>

            <input type="submit" value="Enviar"/>
          </form>
          {/*<table>
            <thead>
              <tr>
                <td>Concepto</td>
                <td>Importe</td>
                <td>Periodicidad</td>
                <td>Día de pago</td>
              </tr>
            </thead>

            <tbody>
              {
                this.props.listaIngresos.map(
                  (ingreso, key)=>{
                    return(
                      <tr key={key}>
                        <td>{ingreso.concepto}</td>
                        <td>${ingreso.importe}</td>
                        <td>{ingreso.periodicidad}</td>
                        <td>{ingreso.diaPago.toISOString().slice(0,10)}</td>
                        <td><button onClick={()=>this.props.borrarIngreso(key)}>Borrar</button></td>
                      </tr>
                    );
                  }
                )
              }
            </tbody>

            </table>*/}

          <button onClick={()=>this.siguiente()}>Seguir</button>

        </div>
    );
  }
  
}