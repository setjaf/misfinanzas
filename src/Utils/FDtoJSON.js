exports.FDtoJSON = function (FormData) {
  let object = {};
  FormData.forEach(
    (value,key)=>{
      object[key]=value;
    }
  );
  return object;
}
