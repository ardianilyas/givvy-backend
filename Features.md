# Features

- [x] Register as creator
- [x] Generate alert token
- [x] Donate to creator
- [x] Payment using QRIS
- [x] Realtime alert message
- [x] Add bank account for creator (create, get, update)

## Note for Running Test
- When fileParallelism set to true (default) when run all test will make db race condition. so either make it false or disable clearDb() first. :Currently is disabled file parallelism
