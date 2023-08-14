export const DetailedScoreLoading = ({ title }: { title: string }) => {
  return (
    <div
      className={`mb-10 flex animate-pulse flex-col overflow-hidden rounded-lg bg-white p-8 shadow-md md:flex-row md:items-start md:p-10 md:pl-0`}
    >
      <div
        className={`mb-6 flex basis-1/4 flex-col items-center justify-center px-4 md:mb-0`}
      >
        <h3
          className={`mb-4 font-roboto-mono text-xl font-bold uppercase text-gray-400`}
        >
          {title}
        </h3>
        <div className={`h-20 w-20 rounded-full bg-gray-200`} />
      </div>
      <div className={`basis-3/4`}>
        <table
          className={`grid min-w-full border-collapse grid-cols-[minmax(70px,0.7fr)_minmax(100px,4fr)] gap-2`}
        >
          <thead
            className={`contents bg-gray-200 text-left font-bold uppercase`}
          >
            <tr className={`contents text-gray-400`}>
              <th>Severity</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody className={`contents`}>
            <tr className={`contents`}>
              <td
                className={`mb-3 h-5 w-16 rounded-md bg-gray-200 font-bold uppercase`}
              />
              <td className={`h-5 w-3/4 rounded-md bg-gray-200 md:w-5/6`} />
            </tr>
            <tr className={`contents`}>
              <td
                className={`mb-3 h-5 w-16 rounded-md bg-gray-200 font-bold uppercase`}
              />
              <td className={`h-5 w-3/4 rounded-md bg-gray-200 md:w-5/6`} />
            </tr>
            <tr className={`contents`}>
              <td
                className={`mb-3 h-5 w-16 rounded-md bg-gray-200 font-bold uppercase`}
              />
              <td className={`h-5 w-3/4 rounded-md bg-gray-200 md:w-5/6`} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
