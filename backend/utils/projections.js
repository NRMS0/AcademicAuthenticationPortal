//Export for public data
module.exports = {
    publicCourseProjection: {
        name: 1,
        description: 1,
        difficulty: 1,
        duration: 1,
        learningObjectives: 1,
        prerequisites: 1,
        'assignments.title': 1,
        'assignments.dueDate': 1
    }
};