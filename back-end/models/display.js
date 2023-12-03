
module.exports = (sequelize, DataTypes) => {
    const Display = sequelize.define(
      "final_questions",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        question: {
          type: DataTypes.TEXT,
        },
        question_type: {
          type: DataTypes.TEXT,
        },
      },
      {
        tableName: "final_questions",
        timestamps: false,
      }
    );
  
    return Display;
  };
  