import generate from "node-chartist";

(async() => {
  const options = {
    width: 400,
    height: 200,
    axisX: { title: 'X Axis (units)' },
    axisY: { title: 'Y Axis (units)' }
  };

  const line = await generate('line', options, {
    labels: ['a', 'b', 'c', 'd', 'e'],
    series: [
      { name: 'Series 1', value: [1, 2, 3, 4, 5] },
      { name: 'Series 2', value: [3, 4, 5, 6, 7] }
    ]
  });
  console.log( line);
})();