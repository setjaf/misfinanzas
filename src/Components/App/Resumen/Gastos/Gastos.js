import React, {Component} from 'react';
import firebase from '../../../../Utils/firebase';
import {FDtoJSON} from '../../../../Utils/FDtoJSON';

const db = firebase.firestore();

export default class Gastos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gastos:[],
    }
    
    this.registrarGasto = this.registrarGasto.bind(this);
    this.borrarGasto = this.borrarGasto.bind(this);
    this.inicializarGastos = this.inicializarGastos.bind(this);
  }  

  componentDidMount(){
    this.inicializarGastos();
  }

  inicializarGastos(){
    const esto = this;
    let gastos = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId).collection('Gastos');
    gastos.get().then((qs)=>{
      let gastos = [];
        qs.docs.map(
          (doc)=>{
            const data = doc.data();
            let gasto = {...data}
            gasto.id = doc.id;
            gasto.registro = gasto.registro.toDate();
            gastos.push(gasto);
            return gasto;
          }
        );
        esto.setState({
          gastos:gastos,
        });
    })
  }

  registrarGasto(event){
    const esto = this;

    event.preventDefault();

    let gastos = this.state.gastos.slice(0,this.state.gastos.length);
    
    let gasto = FDtoJSON(new FormData(event.target));

    gasto.registro = firebase.firestore.Timestamp.now();    

    let presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);
    
    db.runTransaction(
      function (transaction) {
        return transaction.get(presupuesto).then(
          (doc)=>{
            transaction.update(presupuesto,
              {                
                dineroLibre:Number(doc.data().dineroLibre)-Number(gasto.importe),
              }
            );
          }
        );
      }
    );    
    
    presupuesto.collection('Gastos').add(gasto).then(
      (docRef)=>{

        alert('Gasto guardado');

        gasto.id = docRef.id;
        gasto.registro = gasto.registro.toDate();
        gastos.push(
          gasto
        );

        esto.setState({
          gastos:gastos,
        });

      }
    ).catch(
      (a)=>{
        alert(a);
        alert('No se pudo guardar el gasto')
      }
    );
    event.target.reset();
  }

  borrarGasto(gasto){

    const esto = this;

    let gastos = this.state.gastos.slice(0,this.state.gastos.length);

    let presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);

    console.log(gastos);
    console.log(gasto);

    db.runTransaction(
      function (transaction) {
        return transaction.get(presupuesto).then(
          (doc)=>{
            transaction.update(presupuesto,
              {                
                dineroLibre:Number(doc.data().dineroLibre)+Number(gastos[gasto].importe),
              }
            );
          }
        );
      }
    );

    presupuesto.collection('Gastos').doc(gastos[gasto].id).delete().then(
      ()=>{
        gastos.splice(gasto,1);

        esto.setState({
          gastos:gastos,
        });
      }
    );

  }

  render(){
    return(
      <div>
          <form onSubmit={this.registrarGasto}>
            <h4>Gastos fijos en el periodo:</h4>

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
          <table>
            <thead>
              <tr>
                <td>Concepto</td>
                <td>Importe</td>
                <td>Periodicidad</td>
              </tr>
            </thead>

            <tbody>
              {
                this.state.gastos.map(
                  (gasto, key)=>{
                    return(
                      <tr key={key}>
                        <td>{gasto.concepto}</td>
                        <td>${gasto.importe}</td>
                        <td>{`${gasto.registro.getFullYear()}-${gasto.registro.getMonth()+1<10?'0':''}${gasto.registro.getMonth()+1}-${gasto.registro.getDate()<10?'0':''}${gasto.registro.getDate()}`}</td>
                        <td><button onClick={()=>this.pagarGasto(key)}>Realizar Pago</button></td>
                        <td><button onClick={()=>this.borrarGasto(key)}>Borrar</button></td>
                      </tr>
                    );
                  }
                )
              }
            </tbody>

          </table>       

        </div>
    );
  }
  
}