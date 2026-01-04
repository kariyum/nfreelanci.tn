---

kanban-plugin: board

---

## tobe



## p3

- [ ] ids should be u32 not i32
- [ ] change id to uuid for entities that needs this change
- [ ] add dynamic postgres schema support
- [ ] fix cors
- [ ] use bson intead of json to obfuscate request responses (not human readable) 
	Consider: 
	- grpc-web
	- MessagePack
- [ ] add role switching
- [ ] don't show "loading" when on the overview page!
- [ ] add integration tests
- [ ] make richtexteditor buttons unfocused with TAB
- [ ] Assign tasks to applicants after accepting the proposal
- [ ] load mobile css vs desktop css based on width
- [ ] products search, start with what is available in the ui, using service workers to not lag the ui at the same time request remote search and either combine or show API response for completeness


## p2

- [ ] UI unit test
- [ ] add email verification - SMTP server (look for a free provider)
- [ ] add phone number verification
- [ ] keep header / navbar sticky
- [ ] deleting a project makes the screen refresh because of the asynchronous behavior. Fix that.
- [ ] data loading
- [ ] support french and english
- [ ] if user exists return user already exists


## p1

- [ ] forgot password
- [ ] google login
- [ ] add freelancer feature to see ongoing tasks for him
- [ ] sending email capabilities
- [ ] rename urls. Use projects/{id} instead of project/{id}. Plural vs Singular. Plural is the REST standard
- [ ] add on chat message notification
- [ ] discussion page man, get it done well


## doing



## tested



## done

- [ ] add budget form submission
- [ ] add cancelled status color
- [ ] settings page
- [ ] discussion page revamp
- [ ] settings page refresh
- [ ] add discussion context Task content
- [ ] change status colors
- [ ] freelancers removing application
- [ ] freelancer applying to projects
- [ ] change status class name in /task/task_id
- [ ] projects search
- [ ] ritchtexteditor buttons do not react when the cursor is on H1 H2 text while before the cursor was writing in P
- [ ] profile page
- [ ] UI styling
- [ ] dark mode
- [ ] add complete profile setup
- [ ] add profile setup
- [ ] take care of the feature requests page - Karim
- [ ] update websocket messages implementation
- [ ] upon logging in route the user to home page
- [ ] remove accessing writeable store in the +layout.ts page /
- [ ] deleting a project must delete a task!
- [ ] check CRUD capabilities of each entity
- [ ] rename assign to assign_id column
- [ ] update apis for each entity
- [ ] add errors.rs and map each error to our own custom error
- [ ] add authorization middlewear
	- Done with extractors instead of middlewear, the better known approach
- [ ] replace flywaydb with sqlx migrate
- [ ] add unit tests
- [ ] update project structure
- [ ] fix attributes of each entity
- [ ] add tasks
- [ ] going to /login page should redirect you to the landing page if already logged in
- [ ] fix token validation




%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false,false,false]}
```
%%