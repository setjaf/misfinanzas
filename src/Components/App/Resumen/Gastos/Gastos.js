import React, { Component } from 'react';
import firebase from '../../../../Utils/firebase';
import { FDtoJSON } from '../../../../Utils/FDtoJSON';

import Pagos from './Pagos/Pagos';

const db = firebase.firestore();

export default class Gastos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      presupuestoId: this.props.presupuestoId,
      gastos: [],
    }

    this.registrarGasto = this.registrarGasto.bind(this);
    this.borrarGasto = this.borrarGasto.bind(this);
    this.pagarGasto = this.pagarGasto.bind(this);
    this.actualizarGasto = this.actualizarGasto.bind(this);
    this.inicializarGastos = this.inicializarGastos.bind(this);
    this.iniciarListenerActualizaciones = this.iniciarListenerActualizaciones.bind(this);
  }

  componentDidMount() {

    this.inicializarGastos();
    this.iniciarListenerActualizaciones();

  }

  inicializarGastos() {
    const esto = this;
    let gastos = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId).collection('Gastos');
    gastos.get().then((qs) => {
      let gastos = [];
      qs.docs.forEach(
        (doc) => {
          const data = doc.data();
          let gasto = { ...data }
          gasto.id = doc.id;
          gasto.registro = gasto.registro.toDate();
          gastos.push(gasto);
          return gasto;
        }
      );
      esto.setState({
        gastos: gastos,
      });
    })
  }

  registrarGasto(event) {
    const esto = this;

    event.preventDefault();

    let gastos = this.state.gastos.slice(0, this.state.gastos.length);

    let gasto = FDtoJSON(new FormData(event.target));

    gasto.registro = firebase.firestore.Timestamp.now();

    gasto.importeActual = gasto.importeOriginal;

    this.presupuesto.collection('Gastos').add(gasto).then(
      (docRef) => {

        db.runTransaction(
          function (transaction) {
            return transaction.get(esto.presupuesto).then(
              (doc) => {
                transaction.update(esto.presupuesto,
                  {
                    dineroLibre: Number(doc.data().dineroLibre) - Number(gasto.importeOriginal),
                  }
                );
              }
            );
          }
        );

        alert('Gasto guardado');

        gasto.id = docRef.id;
        gasto.registro = gasto.registro.toDate();
        gastos.push(
          gasto
        );

        esto.setState({
          gastos: gastos,
        });

      }
    ).catch(
      (a) => {
        alert('No se pudo guardar el gasto')
      }
    );
    event.target.reset();
  }

  borrarGasto(gasto) {

    const esto = this;

    let gastos = this.state.gastos.slice(0, this.state.gastos.length);

    console.log(gastos);
    console.log(gasto);

    let totalPagos = 0;

    this.presupuesto.collection('Gastos').doc(gastos[gasto].id).collection('Pagos').get().then(
      (qs) => {
        qs.docs.forEach(
          (doc) => {
            console.log(doc)
            totalPagos += Number(doc.data().importe);
          }
        );

        console.log(totalPagos);

        this.presupuesto.collection('Gastos').doc(gastos[gasto].id).delete().then(
          () => {
            let importeGasto = gastos[gasto].importeOriginal;
            db.runTransaction(
              function (transaction) {
                return transaction.get(esto.presupuesto).then(
                  (doc) => {
                    transaction.update(esto.presupuesto,
                      {
                        dineroDisponible: Number(doc.data().dineroDisponible) + Number(totalPagos),
                        dineroLibre: Number(doc.data().dineroLibre) + Number(importeGasto),
                      }
                    );
                  }
                );
              }
            );

            gastos.splice(gasto, 1);

            esto.setState({
              gastos: gastos,
            });
          }
        );

      }
    );



  }

  pagarGasto(event) {
    const esto = this;

    event.preventDefault();

    let pago = FDtoJSON(new FormData(event.target));

    this.presupuesto.collection('Gastos').doc(pago.gastoId).collection('Pagos').add({
      importe: pago.importePago,
      registro: firebase.firestore.Timestamp.now(),
    }).then((docRef) => {

      console.log(docRef.id);

      alert('Pago registrado correctamente');

      db.runTransaction(
        function (transaction) {
          return transaction.get(esto.presupuesto).then(
            (doc) => {
              transaction.update(esto.presupuesto,
                {
                  dineroDisponible: Number(doc.data().dineroDisponible) - Number(pago.importePago),
                }
              );
            }
          );
        }
      );

      db.runTransaction(
        function (transaction) {
          return transaction.get(esto.presupuesto.collection('Gastos').doc(pago.gastoId)).then(
            (doc) => {
              transaction.update(esto.presupuesto.collection('Gastos').doc(pago.gastoId),
                {
                  importeActual: Number(doc.data().importeActual) - Number(pago.importePago),
                }
              );
            }
          );
        }
      );

    });

    console.log(pago);

    event.target.reset();

  }

  actualizarGasto(gastoId, gastoObj) {
    alert("Actualizando gasto");
    let gastos = this.state.gastos.slice(0, this.state.gastos.length);
    console.log(gastos);

    gastos = gastos.map((gasto) => {
      if (gasto.id === gastoId) {
        gasto = gastoObj;
        gasto.id = gastoId;
        gasto.registro = gasto.registro.toDate();
      }
      return gasto;
    });

    console.log(gastos);

    this.setState({
      gastos: gastos,
    })
  }

  iniciarListenerActualizaciones() {
    console.log('Iniciar actualizaciones');

    this.presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);;

    this.presupuesto.collection('Gastos').onSnapshot((qs) => {
      //console.log(qs);
      //console.log(qs.docChanges())
      qs.docChanges().forEach((change) => {

        if (change.type === 'modified') {
          //console.log(change.doc.data());

          this.actualizarGasto(change.doc.id, change.doc.data());
        }

      });

    });

  }

  render() {

    if (this.props.presupuestoId !== this.state.presupuestoId) {

      console.log('Cambió presupuesto id');

      this.inicializarGastos();
      
      this.setState({
        presupuestoId: this.props.presupuestoId,
      });

      this.iniciarListenerActualizaciones();
    }
    return (
      <div>
        <form onSubmit={this.registrarGasto}>
          <h3>Agregar gasto al periodo:</h3>

          <div>
            <label>
              Concepto:
              </label>
            <input type="text" name="concepto" required />
          </div>

          <div>
            <label>
              Importe:
              </label>
            <input type="text" name="importeOriginal" required />
          </div>

          <input type="submit" value="Enviar" />
        </form>

        <div>
          <h3>Lista de gastos</h3>
          <ul>
            {
              this.state.gastos.map(
                (gasto, key) => {
                  return (
                    <li key={key}>
                      <details>
                        <summary>{`${gasto.concepto} - $${gasto.importeActual}`}</summary>
                        <p>{`Importe original: $${gasto.importeOriginal}`}</p>
                        <p>{`Registrado: ${gasto.registro.getFullYear()}-${gasto.registro.getMonth() + 1 < 10 ? '0' : ''}${gasto.registro.getMonth() + 1}-${gasto.registro.getDate() < 10 ? '0' : ''}${gasto.registro.getDate()}`}</p>
                        <div>
                          <form onSubmit={(event) => this.pagarGasto(event)}>
                            <input type="text" name="gastoId" value={gasto.id} readOnly={true} hidden={true} />
                            <label>
                              Importe:
                                </label>
                            <input type="number" name="importePago" required />
                            <input type="submit" value="Realizar Pago" />
                          </form>
                        </div>                        
                        <div><button onClick={() => this.borrarGasto(key)}>Borrar</button></div>
                        <div><Pagos IdGasto={gasto.id} uid={this.props.uid} presupuestoId={this.props.presupuestoId}/></div>
                      </details>

                    </li>
                  );
                }
              )
            }

          </ul>
        </div>

      </div>
    );
  }

}