// used for storing added tasks that are not saved yet!

import type { TaskForm } from "$lib/features/project/models";
import type { TaskGET } from "$lib/features/task/models";

export class TaskClass {
    title: string = $state('');
    assignee_id: string = $state('');
    status: string = $state('');
    content: string = $state('')
    deadline: string = $state('');
    budget?: number = $state(0);
    skills: string[] = $state([]);
    id?: number = $state(undefined);

    constructor(
        title: string = '',
        assignee_id: string = '',
        status: string = 'todo',
        content: string = '',
        deadline: string = '',
        budget: number | undefined = undefined,
        skills: string[] = []
    ) {
        this.title = title;
        this.assignee_id = assignee_id;
        this.status = status;
        this.content = content;
        this.deadline = deadline;
        this.budget = budget;
        this.skills = skills;
    }


    copy(): TaskClass {
        return new TaskClass(
            this.title,
            this.assignee_id,
            this.status,
            this.content,
            this.deadline,
            this.budget,
            this.skills
        ).withId(this.id);
    }

    // assign from 
    assignFrom(task: TaskClass): void {
        this.title = task.title;
        this.assignee_id = task.assignee_id;
        this.status = task.status;
        this.content = task.content;
        this.deadline = task.deadline;
        this.budget = task.budget;
        this.skills = task.skills;
    }

    withId(id: number | undefined): TaskClass {
        this.id = id;
        return this;
    }

    static fromGET(task: TaskGET): TaskClass {
        const res = new TaskClass(
            task.title,
            task.assignee_id,
            task.status,
            task.content,
            task.deadline.toLocaleDateString('en-CA'),
            task.budget,
            task.skills
        ).withId(task.id);
        return res;
    }

    addSkill(skill: string): void {
        this.skills.push(skill);
    }

    removeSkillIndex(index: number): void {
        this.skills.splice(index, 1);
    }

    toTaskForm(): TaskForm {
        const taskForm: TaskForm = $state.snapshot({
            title: this.title,
            content: this.content,
            deadline: this.deadline,
            budget: this.budget,
            skills: this.skills
        })
        return taskForm;
    }
}
