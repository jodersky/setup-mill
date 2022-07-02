# GitHub Action to Set up Mill

Use this action to make [mill](http://www.lihaoyi.com/mill/) available in a job.

```yaml
- uses: jodersky/setup-mill@master
  with:
    mill-version: 0.10.4
- name: Compile
  run: mill project.compile
# the server process is kept alive across steps,
# so separate invocations of mill remain extremely fast!
- name: Test
  run: mill project.test
```
