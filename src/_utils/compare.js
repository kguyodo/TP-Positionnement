function compareObjectData(objectToCheck) {
  const updatedData = { ...objectToCheck };

  Object.keys(objectToCheck).forEach((key) => {
    if (objectToCheck[key] !== newData[key]) {
      updatedData[key] = newData[key];
    }
  });

  return updatedData;
}
export default compareObjectData;
