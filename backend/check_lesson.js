const { Sequelize } = require("sequelize");
const s = new Sequelize("upskillize_lms", "root", "Puja", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});
s.query(
  "SELECT id, lesson_name, youtube_video_id, description, content_type FROM lessons LIMIT 5",
)
  .then(([r]) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
