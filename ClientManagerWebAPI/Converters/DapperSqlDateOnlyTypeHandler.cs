using Dapper;
using System.Data;
using System.Diagnostics;
using System.Globalization;

namespace ClientManagerWebAPI.Converters
{
    public class DapperSqlDateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
    {
        public override void SetValue(IDbDataParameter parameter, DateOnly date)
            => parameter.Value = date;

        public override DateOnly Parse(object value)
        {
            bool failed = false;
            try
            {
                return DateOnly.FromDateTime((DateTime)value);
            }
            catch (System.InvalidCastException)
            {
                Debug.WriteLine("Type given was not a DateTime");
                failed = true;
            }
            if (failed)
            {
                try
                {
                    return DateOnly.Parse((string)value);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Type given was not a DateTime or string");
                }
            }
            return DateOnly.FromDateTime((DateTime)value);
            
        }
    }
}
