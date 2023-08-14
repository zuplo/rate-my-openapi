export const DetailedScoreLoading = ({ title }: { title: string }) => {
  return (
    <div
      className={`mb-10 flex flex-col overflow-hidden rounded-lg bg-white p-8 shadow-md md:flex-row md:items-start md:p-10 md:pl-0 animate-pulse`}
    >
      <div
        className={`mb-6 flex basis-1/4 flex-col items-center justify-center px-4 md:mb-0`}
      >
        <h3
          className={`mb-4 font-roboto-mono text-xl font-bold uppercase text-gray-400`}
        >
          {title}
        </h3>
        <div className={`w-20 h-20 rounded-full bg-gray-200`} />
      </div>
      <div className={`basis-3/4`}>
        <table
          className={`grid min-w-full border-collapse grid-cols-[minmax(70px,0.7fr)_minmax(100px,4fr)] gap-2`}
        >
          <thead
            className={`contents text-left font-bold uppercase bg-gray-200`}
          >
            <tr className={`contents text-gray-400`}>
              <th>Severity</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody className={`contents`}>
            <tr className={`contents`}>
              <td
                className={`font-bold uppercase bg-gray-200 h-5 w-16 rounded-md mb-3`}
              />
              <td className={`bg-gray-200 h-5 w-3/4 md:w-5/6 rounded-md`} />
            </tr>
            <tr className={`contents`}>
              <td
                className={`font-bold uppercase bg-gray-200 h-5 w-16 rounded-md mb-3`}
              />
              <td className={`bg-gray-200 h-5 w-3/4 md:w-5/6 rounded-md`} />
            </tr>
            <tr className={`contents`}>
              <td
                className={`font-bold uppercase bg-gray-200 h-5 w-16 rounded-md mb-3`}
              />
              <td className={`bg-gray-200 h-5 w-3/4 md:w-5/6 rounded-md`} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
